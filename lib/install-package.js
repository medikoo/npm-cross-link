"use strict";

const { resolve }       = require("path")
    , log               = require("log4").get("dev-package")
    , isDirectory       = require("fs2/is-directory")
    , isSymlink         = require("fs2/is-symlink")
    , readdir           = require("fs2/readdir")
    , rm                = require("fs2/rm")
    , cleanupNpmInstall = require("./cleanup-npm-install")
    , getNpmModulesPath = require("./get-npm-modules-path")
    , runProgram        = require("./run-program")
    , setupRepository   = require("./setup-repository");

const linkPackage = async context => {
	const { path, name } = context;
	const symlinkPath = resolve(await getNpmModulesPath(), name);
	if (await isSymlink(symlinkPath, { linkPath: path })) return;
	await rm(symlinkPath, { loose: true, recursive: true, force: true });
	log.info("link %s", name);
	try {
		await runProgram("npm", ["link"], { cwd: path, logger: log.levelRoot.get("npm:link") });
	} catch (error) {
		await cleanupNpmInstall(context);
		if (await isSymlink(symlinkPath, { linkPath: path })) {
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

const finalize = async ({ name }, progressData) => {
	const { done, ongoingMap } = progressData;
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
	progressData.emit("end", { name });
};

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { name } = packageContext;
	const { hooks, packagesPath, packagesMeta } = userConfiguration;
	const { ongoingMap } = progressData;
	packageContext.meta = packagesMeta[name];
	const path = (packageContext.path = resolve(packagesPath, name));

	progressData.emit("start", { name, type: (await isDirectory(path)) ? "update" : "install" });

	const pendingJobs = (packageContext.pendingJobs = []);
	log.debug("mark %s as ongoing", name);
	ongoingMap.set(name, pendingJobs);

	// Ensure repository is up to date
	await setupRepository(packageContext, inputOptions);

	// Cleanup outcome of eventual previous npm crashes
	await cleanupNpmInstall(packageContext);

	// Setup dependencies
	// (cyclic dependency so required on spot)
	await require("./private/setup-dependencies")(
		packageContext, userConfiguration, inputOptions, progressData
	);

	// Link package
	await linkPackage(packageContext);

	// Run eventual afterPackageInstall hooks
	if (hooks.afterPackageInstall) {
		await hooks.afterPackageInstall(packageContext, userConfiguration, inputOptions);
	}

	// Cleanup unexpected dependencies from node_modules
	await cleanNonDirectDependencies(packageContext, userConfiguration);

	// Notify and cleanup
	return finalize(packageContext, progressData);
};
