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

const setupDependency = async (context, configuration, options) => {
	const { dependencyName, isExternal } = context;
	if (!isExternal) {
		if (ongoingMap.has(dependencyName)) {
			ongoingMap.get(dependencyName).push(() => setupNpmLink(context));
			return;
		}
		if (!done.has(dependencyName)) {
			await module.exports({ name: dependencyName }, configuration, options);
		}
	}
	await setupNpmLink(context);
};

const resolveDependencyContext = (context, dependencyName, configuration) => {
	const { name, path } = context;
	const { packagesMeta } = configuration;
	return {
		dependentName: name,
		dependentPath: path,
		dependencyName,
		isExternal: !packagesMeta[dependencyName]
	};
};

const setupDependencies = async (context, configuration, options) => {
	const { name, path } = context;
	const pkgJson = (context.pkgJson = require(resolve(path, "package.json")));
	const dependencies = (context.dependencies = new Set(
		Object.keys(pkgJson.dependencies || {}).concat(Object.keys(pkgJson.devDependencies || {}))
	));
	dependencies.delete(name);

	log.info("for %s setup dependencies %o", name, dependencies);
	for (const dependencyName of dependencies) {
		await setupDependency(
			resolveDependencyContext(context, dependencyName, configuration), configuration, options
		);
	}

	// Eventual optional dependencies
	for (const dependencyName of Object.keys(pkgJson.optionalDependencies || {})) {
		if (dependencyName === name) continue;
		if (dependencies.has(dependencyName)) continue;
		dependencies.add(dependencyName);
		const dependencyContext = resolveDependencyContext(context, dependencyName, configuration);
		if (dependencyContext.isExternal) {
			await setupDependency(dependencyContext, configuration, options);
			continue;
		}
		try { await setupNpmLink(dependencyContext); }
		catch (error) {
			log.error(
				`Could not link optional dependency %s, crashed with:\n${ error.stack }`,
				dependencyName
			);
		}
	}
};

const linkPackage = async context => {
	const { path, name } = context;
	const symlinkPath = resolve(await getNpmModulesPath(), name);
	if (await isValidSymlink(symlinkPath, path)) return;
	await rm(symlinkPath, { loose: true, recursive: true, force: true });
	log.info("link %s", name);
	try {
		await runProgram("npm", ["link"], { cwd: path, logger: log.levelRoot.get("npm:link") });
	} catch (error) {
		await cleanupNpmInstall(context);
		if (await isValidSymlink(symlinkPath, path)) {
			log.warning("npm crashed, still link was created so we're ignoring it");
			return;
		}

		throw error;
	}
};

const cleanNonDirectDependencies = async (context, { userDependencies }) => {
	const { name, path, dependencies } = context;
	const allowedPaths = new Set(
		[".", "..", ".bin"].concat(
			Array.from(dependencies)
				.concat(userDependencies)
				.map(dependencyName => dependencyName.split("/")[0])
		)
	);
	const packageNodeModulesPath = resolve(path, "node_modules");
	return Promise.all(
		(await readdir(packageNodeModulesPath)).map(dependencyPath => {
			if (allowedPaths.has(dependencyPath)) return null;
			log.info("in %s remove unexpected dependency %s", name, dependencyPath);
			return rm(resolve(packageNodeModulesPath, dependencyPath), {
				force: true,
				loose: true,
				recursive: true
			});
		})
	);
};

const finalize = async ({ name }) => {
	log.debug("mark %s as done", name);
	done.add(name);

	const pendingJobs = ongoingMap.get(name);
	log.debug("remove %s from ongoing", name);
	ongoingMap.delete(name);

	// Run pending jobs
	if (pendingJobs.length) {
		log.info("run pending jobs of %s", name);
		for (const pendingJob of pendingJobs) await pendingJob();
	}
	module.exports.emit("end", { name });
};

module.exports = ee(async (context, configuration, options) => {
	const { name } = context;
	const { hooks, packagesPath, packagesMeta } = configuration;
	context.meta = packagesMeta[name];
	const path = (context.path = resolve(packagesPath, name));

	module.exports.emit("start", { name, type: (await isDirectory(path)) ? "update" : "install" });

	const pendingJobs = (context.pendingJobs = []);
	log.debug("mark %s as ongoing", name);
	ongoingMap.set(name, pendingJobs);

	// Setup repository
	await setupRepository(context, options);

	// Cleanup eventual npm crashes
	await cleanupNpmInstall(context);

	// Setup dependencies
	await setupDependencies(context, configuration, options);

	// Link package
	await linkPackage(context);

	// Run eventual afterPackageInstall hooks
	if (hooks.afterPackageInstall) await hooks.afterPackageInstall(context, configuration, options);

	// Remove any unexpected dependencies from node_modules
	await cleanNonDirectDependencies(context, configuration);

	// Notify and cleanup
	return finalize(context);
});
