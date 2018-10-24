"use strict";

const { resolve }       = require("path")
    , log               = require("log4").get("dev-package")
    , ee                = require("event-emitter")
    , realpath          = require("fs2/realpath")
    , cleanupNpmInstall = require("./cleanup-npm-install")
    , getNpmModulesPath = require("./get-npm-modules-path")
    , isPackageLinked   = require("./is-package-linked")
    , isDirectory       = require("./is-directory")
    , runProgram        = require("./run-program")
    , setupRepository   = require("./setup-repository")
    , setupNpmLink      = require("./setup-npm-link");

const ongoingMap = new Map();
const done = new Set();

const setupDependencies = async (packageName, { packagesPath, packagesMeta, hooks }) => {
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
		if (!done.has(dependencyName)) {
			if (ongoingMap.has(dependencyName)) {
				ongoingMap
					.get(dependencyName)
					.push(() => setupNpmLink(packagePath, dependencyName));
				continue;
			} else if (packagesMeta[dependencyName]) {
				await module.exports(dependencyName, { packagesPath, packagesMeta, hooks });
			}
		}
		await setupNpmLink(packagePath, dependencyName);
	}

	// Eventual optional dependencies
	for (const dependencyName of Object.keys(packagePkgJson.optionalDependencies || {})) {
		if (dependencyName === packageName) continue;
		if (dependencies.has(dependencyName)) continue;
		try { await setupNpmLink(packagePath, dependencyName); }
		catch (error) {
			log.error(
				`Could not link optional dependency %s, crashed with:\n${ error.stack }`,
				dependencyName
			);
		}
	}
};

const linkPackage = async (packagePath, packageName) => {
	log.info("link %s", packageName);
	try {
		await runProgram("npm", ["link"], {
			cwd: packagePath,
			logger: log.levelRoot.get("npm:link")
		});
	} catch (error) {
		log.error("npm link of %s crashed:\n%#s", packageName, error.stderr);
		if (
			(await realpath(resolve(await getNpmModulesPath(), packageName), { loose: true })) ===
			packagePath
		) {
			log.warning("npm crashed but as link was created we're ignoring that fact");
			return;
		}

		throw error;
	}
};

module.exports = ee(async (packageName, { packagesPath, packagesMeta, hooks }) => {
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
	await setupDependencies(packageName, { packagesPath, packagesMeta, hooks });

	// Link package
	if (!(await isPackageLinked(packageName))) await linkPackage(packagePath, packageName);

	// Run eventual afterPackageInstall hooks
	if (hooks.afterPackageInstall) {
		await hooks.afterPackageInstall(packageName, {
			packagesPath,
			packageMeta: packagesMeta[packageName]
		});
	}

	// Done
	module.exports.emit("end", { packageName });
	done.add(packageName);
	ongoingMap.delete(packageName);

	// Run pending jobs
	if (pendingJobs.length) {
		log.info("run pending jobs of %s", packageName);
		for (const pendingJob of pendingJobs) await pendingJob();
	}
});
