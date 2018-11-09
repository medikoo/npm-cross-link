"use strict";

const { resolve }     = require("path")
    , rmdir           = require("fs2/rmdir")
    , logger          = require("log4").get("setup-own-package")
    , isOwnPackage    = require("./is-own-package")
    , isPackageLinked = require("./is-package-linked")
    , runProgram      = require("./run-program")
    , setupPrettier   = require("./setup-prettier")
    , setupRepository = require("./setup-repository")
    , setupNpmLink    = require("./setup-npm-link");

const exceptionsMap = new Map([["webmake", "modules-webmake"], ["next", "node-ext"]]);

const ongoingMap = new Map();
const done = new Set();

const setupDependencies = async (packagesPath, packageName) => {
	const packagePath = resolve(packagesPath, packageName);
	const packageMeta = require(resolve(packagePath, "package.json"));
	const dependencies = new Set(
		Object.keys(packageMeta.dependencies || {}).concat(
			Object.keys(packageMeta.devDependencies || {})
		)
	);
	dependencies.delete(packageName);

	logger.notice("setup dependencies of %s", packageName);
	for (const dependencyName of dependencies) {
		if (!done.has(dependencyName)) {
			if (ongoingMap.has(dependencyName)) {
				ongoingMap
					.get(dependencyName)
					.push(() => setupNpmLink(packagePath, dependencyName));
				continue;
			} else if (exceptionsMap.has(dependencyName) || await isOwnPackage(dependencyName)) {
				await module.exports(packagesPath, dependencyName);
			}
		}
		await setupNpmLink(packagePath, dependencyName);
	}

	// Eventual optional dependencies
	for (const dependencyName of Object.keys(packageMeta.optionalDependencies || {})) {
		if (dependencyName === packageName) continue;
		if (dependencies.has(dependencyName)) continue;
		try { await setupNpmLink(packagePath, dependencyName); }
		catch (error) {
			logger.error(
				`Could not link optional dependency %s, crashed with:\n${ error.stack }`,
				dependencyName
			);
		}
	}
};

module.exports = async (packagesPath, packageName) => {
	const packagePath = resolve(packagesPath, packageName);

	logger.notice("setup package %s", packageName);
	const pendingJobs = [];
	ongoingMap.set(packageName, pendingJobs);

	// Setup repository
	await setupRepository(
		packagePath, `git@github.com:medikoo/${ exceptionsMap.get(packageName) || packageName }.git`
	);

	// Cleanup eventual npm crashes
	await rmdir(resolve(packagePath, "node_modules/.staging"), {
		loose: true,
		recursive: true,
		force: true
	});

	// Setup dependencies
	await setupDependencies(packagesPath, packageName);

	// Link package
	if (!await isPackageLinked(packageName)) {
		logger.notice("link %s", packageName);
		await runProgram("npm", ["link"], {
			cwd: packagePath,
			logger: logger.levelRoot.get("npm:link")
		});
	}

	// Setup prettier link
	await setupPrettier(packagesPath, packagePath);

	// Done
	logger.notice("done %s", packageName);
	done.add(packageName);
	ongoingMap.delete(packageName);

	// Run pending jobs
	if (pendingJobs.length) {
		logger.notice("run pending jobs of %s", packageName);
		for (const pendingJob of pendingJobs) await pendingJob();
	}
};
