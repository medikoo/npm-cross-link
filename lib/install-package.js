"use strict";

const { resolve }       = require("path")
    , log               = require("log4").get("dev-package")
    , ee                = require("event-emitter")
    , readdir           = require("fs2/readdir")
    , rm                = require("fs2/rm")
    , cleanupNpmInstall = require("./cleanup-npm-install")
    , getNpmModulesPath = require("./get-npm-modules-path")
    , isValidSymlink    = require("./is-valid-symlink")
    , isDirectory       = require("./is-directory")
    , runProgram        = require("./run-program")
    , setupRepository   = require("./setup-repository")
    , setupNpmLink      = require("./setup-npm-link");

const ongoingMap = new Map();
const done = new Set();

const setupDependency = async (packagePath, dependencyName, configuration) => {
	const { packagesMeta } = configuration;
	if (done.has(dependencyName)) return;
	if (ongoingMap.has(dependencyName)) {
		ongoingMap.get(dependencyName).push(() => setupNpmLink(packagePath, dependencyName));
		return;
	}
	if (packagesMeta[dependencyName]) await module.exports(dependencyName, configuration);
	await setupNpmLink(packagePath, dependencyName);
};

const setupDependencies = async (packageName, configuration) => {
	const { packagesMeta, packagesPath } = configuration;
	const packagePath = resolve(packagesPath, packageName);
	const packagePkgJson = require(resolve(packagePath, "package.json"));
	const dependencies = new Set(
		Object.keys(packagePkgJson.dependencies || {}).concat(
			Object.keys(packagePkgJson.devDependencies || {})
		)
	);
	dependencies.delete(packageName);

	log.info("setup dependencies of %s", packageName);
	for (const dependencyName of dependencies) {
		await setupDependency(packagePath, dependencyName, configuration);
	}

	// Eventual optional dependencies
	for (const dependencyName of Object.keys(packagePkgJson.optionalDependencies || {})) {
		if (dependencyName === packageName) continue;
		if (dependencies.has(dependencyName)) continue;
		dependencies.add(dependencyName);
		if (packagesMeta[dependencyName]) {
			await setupDependency(packagePath, dependencyName, configuration);
			continue;
		}
		try { await setupNpmLink(packagePath, dependencyName); }
		catch (error) {
			log.error(
				`Could not link optional dependency %s, crashed with:\n${ error.stack }`,
				dependencyName
			);
		}
	}

	return dependencies;
};

const linkPackage = async (packagePath, packageName) => {
	const symlinkPath = resolve(await getNpmModulesPath(), packageName);
	if (await isValidSymlink(symlinkPath, packagePath)) return;
	await rm(symlinkPath, { loose: true, recursive: true, force: true });
	log.info("link %s", packageName);
	try {
		await runProgram("npm", ["link"], {
			cwd: packagePath,
			logger: log.levelRoot.get("npm:link")
		});
	} catch (error) {
		log.error("npm link of %s crashed:\n%#s", packageName, error.stderr);
		await cleanupNpmInstall(packagePath);
		if (await isValidSymlink(symlinkPath, packagePath)) {
			log.warning("npm crashed, however link was created so we're ignoring that fact");
			return;
		}

		throw error;
	}
};

const cleanNonDirectDependencies = async (
	packageName,
	packagePath,
	dependencies,
	{ userDependencies }
) => {
	const allowedPaths = new Set(
		[".", "..", ".bin"].concat(
			Array.from(dependencies)
				.concat(userDependencies)
				.map(dependencyName => dependencyName.split("/")[0])
		)
	);
	const packageNodeModulesPath = resolve(packagePath, "node_modules");
	return Promise.all(
		(await readdir(packageNodeModulesPath)).map(path => {
			if (allowedPaths.has(path)) return null;
			log.notice("in %s remove unexpected dependency path %s", packageName, path);
			return rm(resolve(packageNodeModulesPath, path), {
				force: true,
				loose: true,
				recursive: true
			});
		})
	);
};

module.exports = ee(async (packageName, configuration) => {
	const { hooks, packagesPath, packagesMeta } = configuration;
	const packagePath = resolve(packagesPath, packageName);

	module.exports.emit("start", {
		packageName,
		type: (await isDirectory(packagePath)) ? "update" : "install"
	});

	const pendingJobs = [];
	ongoingMap.set(packageName, pendingJobs);

	// Setup repository
	await setupRepository(packagePath, packagesMeta[packageName].repoUrl);

	// Cleanup eventual npm crashes
	await cleanupNpmInstall(packagePath);

	// Setup dependencies
	const dependencies = await setupDependencies(packageName, configuration);

	// Link package
	await linkPackage(packagePath, packageName);

	// Run eventual afterPackageInstall hooks
	if (hooks.afterPackageInstall) {
		await hooks.afterPackageInstall(packageName, {
			packagesPath,
			packageMeta: packagesMeta[packageName]
		});
	}

	await cleanNonDirectDependencies(packageName, packagePath, dependencies, configuration);

	// Done
	done.add(packageName);
	ongoingMap.delete(packageName);

	// Run pending jobs
	if (pendingJobs.length) {
		log.info("run pending jobs of %s", packageName);
		for (const pendingJob of pendingJobs) await pendingJob();
	}
	module.exports.emit("end", { packageName });
});
