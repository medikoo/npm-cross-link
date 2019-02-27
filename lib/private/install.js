"use strict";

const { resolve }                   = require("path")
    , wait                          = require("timers-ext/promise/sleep")
    , cleanupNpmInstall             = require("./cleanup-npm-install")
    , getPackageJson                = require("./get-package-json")
    , removeNonDirectDependencies   = require("./remove-non-direct-dependencies")
    , installMaintainedPackage      = require("./install-maintained-package")
    , updatePackageJsonDependencies = require("./update-package-json-dependencies");

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { path } = packageContext;
	const { packagesMeta, packagesPath } = userConfiguration;
	const { ongoing } = progressData;
	if (!packageContext.packageJson) packageContext.packageJson = getPackageJson(path);
	const { packageJson } = packageContext;
	if (!packageJson) return;
	let name = (packageContext.name = packageJson.name);

	if (packagesMeta[name] && resolve(packagesPath, name) === path) {
		await installMaintainedPackage(
			packageContext, userConfiguration, inputOptions, progressData
		);
		return;
	}
	if (packagesMeta[name]) {
		// Named as maintained but located elsewhere, ensure to not use same name;
		name = packageContext.name = `${ name } (external)`;
	}

	// Ensure to emit "start" event in next event loop
	await wait();

	packageContext.installationType = "update";
	packageContext.installationJobs = new Set();
	ongoing.set(name, packageContext);

	progressData.emit("start", packageContext);

	// Cleanup outcome of eventual previous npm crashes
	await cleanupNpmInstall(packageContext);

	// Cyclic module dependency, hence required on spot
	await require("./setup-dependencies")(
		packageContext, userConfiguration, inputOptions, progressData
	);

	await Promise.all([
		// Ensure node_modules is clean from unrelated installs
		removeNonDirectDependencies(packageContext, userConfiguration),
		// Keep dependencies in package.json fresh
		!inputOptions.noSave && updatePackageJsonDependencies(packageContext)
	]);

	ongoing.delete(name);
	progressData.emit("end", packageContext);
};
