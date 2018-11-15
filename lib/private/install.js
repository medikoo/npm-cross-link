"use strict";

const { resolve }                 = require("path")
    , wait                        = require("timers-ext/promise/sleep")
    , cleanupNpmInstall           = require("./cleanup-npm-install")
    , getPackageJson              = require("./get-package-json")
    , removeNonDirectDependencies = require("./remove-non-direct-dependencies")
    , installPackage              = require("./install-package");

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { path } = packageContext;
	const { packagesMeta, packagesPath } = userConfiguration;
	const packageJson = (packageContext.packageJson = getPackageJson(path));
	if (!packageJson) return;
	const name = (packageContext.name = packageJson.name);

	if (packagesMeta[name] && resolve(packagesPath, name) === path) {
		await installPackage(packageContext, userConfiguration, inputOptions, progressData);
		return;
	}

	// Ensure to emit "start" event in next event loop
	await wait();

	packageContext.installationType = "update";
	packageContext.installationJobs = new Set();
	progressData.emit("start", packageContext);

	// Cleanup outcome of eventual previous npm crashes
	await cleanupNpmInstall(packageContext);

	// Cyclic module dependency, hence required on spot
	await require("./setup-dependencies")(
		packageContext, userConfiguration, inputOptions, progressData
	);

	// Cleanup unexpected dependencies from node_modules
	await removeNonDirectDependencies(packageContext, userConfiguration);

	progressData.emit("end", packageContext);
};
