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

const setupDependency = async (
	packageName,
	packagePath,
	dependencyName,
	configuration,
	options
) => {
	const { packagesMeta } = configuration;
	const isExternal = !packagesMeta[dependencyName];
	if (!isExternal) {
		if (ongoingMap.has(dependencyName)) {
			ongoingMap
				.get(dependencyName)
				.push(() => setupNpmLink(packageName, packagePath, dependencyName));
			return;
		}
		if (!done.has(dependencyName)) await module.exports(dependencyName, configuration, options);
	}
	await setupNpmLink(packageName, packagePath, dependencyName, { isExternal });
};

const setupDependencies = async (packageName, configuration, options) => {
	const { packagesMeta, packagesPath } = configuration;
	const packagePath = resolve(packagesPath, packageName);
	const packagePkgJson = require(resolve(packagePath, "package.json"));
	const dependencies = new Set(
		Object.keys(packagePkgJson.dependencies || {}).concat(
			Object.keys(packagePkgJson.devDependencies || {})
		)
	);
	dependencies.delete(packageName);

	log.info("for %s setup dependencies %o", packageName, dependencies);
	for (const dependencyName of dependencies) {
		await setupDependency(packageName, packagePath, dependencyName, configuration, options);
	}

	// Eventual optional dependencies
	for (const dependencyName of Object.keys(packagePkgJson.optionalDependencies || {})) {
		if (dependencyName === packageName) continue;
		if (dependencies.has(dependencyName)) continue;
		dependencies.add(dependencyName);
		if (packagesMeta[dependencyName]) {
			await setupDependency(packageName, packagePath, dependencyName, configuration, options);
			continue;
		}
		try { await setupNpmLink(packageName, packagePath, dependencyName); }
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
		await cleanupNpmInstall(packagePath);
		if (await isValidSymlink(symlinkPath, packagePath)) {
			log.warning("npm crashed, still link was created so we're ignoring it");
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
			log.info("in %s remove unexpected dependency %s", packageName, path);
			return rm(resolve(packageNodeModulesPath, path), {
				force: true,
				loose: true,
				recursive: true
			});
		})
	);
};

const finalize = async packageName => {
	log.debug("mark %s as done", packageName);
	done.add(packageName);

	const pendingJobs = ongoingMap.get(packageName);
	log.debug("remove %s from ongoing", packageName);
	ongoingMap.delete(packageName);

	// Run pending jobs
	if (pendingJobs.length) {
		log.info("run pending jobs of %s", packageName);
		for (const pendingJob of pendingJobs) await pendingJob();
	}
	module.exports.emit("end", { packageName });
};

module.exports = ee(async (packageName, configuration, options) => {
	const { hooks, packagesPath, packagesMeta } = configuration;
	const packagePath = resolve(packagesPath, packageName);

	module.exports.emit("start", {
		packageName,
		type: (await isDirectory(packagePath)) ? "update" : "install"
	});

	const pendingJobs = [];
	log.debug("mark %s as ongoing", packageName);
	ongoingMap.set(packageName, pendingJobs);

	// Setup repository
	await setupRepository(packagePath, packagesMeta[packageName].repoUrl, options);

	// Cleanup eventual npm crashes
	await cleanupNpmInstall(packagePath);

	// Setup dependencies
	const dependencies = await setupDependencies(packageName, configuration, {
		skipGitUpdate: options.skipNestedGitUpdate || options.skipGitUpdate
	});

	// Link package
	await linkPackage(packagePath, packageName);

	// Run eventual afterPackageInstall hooks
	if (hooks.afterPackageInstall) {
		await hooks.afterPackageInstall(
			packageName, { packagesPath, packageMeta: packagesMeta[packageName] }, options
		);
	}

	// Remove any unexpected dependencies from node_modules
	await cleanNonDirectDependencies(packageName, packagePath, dependencies, configuration);

	// Notify and cleanup
	return finalize(packageName);
});
