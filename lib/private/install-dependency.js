"use strict";

const { resolve }       = require("path")
    , wait              = require("timers-ext/promise/sleep")
    , cleanupNpmInstall = require("./cleanup-npm-install")
    , setupDependency   = require("./setup-dependency");

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependentContext } = dependencyContext;
	const { path } = dependentContext;
	let { name } = dependentContext;
	const { packagesMeta, packagesPath } = userConfiguration;
	const { ongoing } = progressData;

	if (packagesMeta[name] && resolve(packagesPath, name) !== path) {
		// Named as maintained but located elsewhere, ensure to not use same name;
		name = dependentContext.name = `${ name } (external)`;
	}

	// Ensure to emit "start" event in next event loop
	await wait();

	dependentContext.installationType = "update";
	dependentContext.installationJobs = new Set();
	ongoing.set(name, dependentContext);

	progressData.emit("start", dependentContext);

	// Cleanup outcome of eventual previous npm crashes
	await cleanupNpmInstall(dependentContext);

	await setupDependency(dependencyContext, userConfiguration, inputOptions, progressData);

	ongoing.delete(name);
	progressData.emit("end", dependentContext);
};
