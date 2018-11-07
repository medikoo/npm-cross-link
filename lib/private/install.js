"use strict";

const wait                        = require("timers-ext/promise/sleep")
    , cleanupNpmInstall           = require("./cleanup-npm-install")
    , getPackageJson              = require("./get-package-json")
    , removeNonDirectDependencies = require("./remove-non-direct-dependencies")
    , setupDependencies           = require("./setup-dependencies");

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { path } = packageContext;
	const { hooks } = userConfiguration;
	const packageJson = (packageContext.packageJson = getPackageJson(path));
	if (!packageJson) return;
	const name = (packageContext.name = packageJson.name);

	// Ensure to emit "start" event in next event loop
	await wait();
	progressData.emit("start", { name, type: "update" });

	// Cleanup outcome of eventual previous npm crashes
	await cleanupNpmInstall(packageContext);

	await setupDependencies(packageContext, userConfiguration, inputOptions, progressData);

	if (hooks.afterPackageInstall) {
		await hooks.afterPackageInstall(packageContext, userConfiguration, inputOptions);
	}

	// Cleanup unexpected dependencies from node_modules
	await removeNonDirectDependencies(packageContext, userConfiguration);

	progressData.emit("end", { name });
};
