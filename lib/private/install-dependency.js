"use strict";

const optionalChaining           = require("es5-ext/optional-chaining")
    , { resolve }                = require("path")
    , wait                       = require("timers-ext/promise/sleep")
    , cleanupNpmInstall          = require("./cleanup-npm-install")
    , setupDependency            = require("./setup-dependency")
    , resolveUpdatedVersionRange = require("./resolve-updated-version-range")
    , updatePackageJson          = require("./update-package-json");

const resolveDependenciesSection = dependencyContext => {
	const { name, dependentContext: { packageJson } } = dependencyContext;
	if (optionalChaining(packageJson.dependencies, name)) return packageJson.dependencies;
	if (optionalChaining(packageJson.devDependencies, name)) return packageJson.devDependencies;
	if (optionalChaining(packageJson.optionalDependencies, name)) {
		return packageJson.optionalDependencies;
	}
	if (!packageJson.dependencies) packageJson.dependencies = {};
	return packageJson.dependencies;
};

const resolveVersionUpdate = (dependencyContext, { forcedVersionRange }) => {
	const versionRange = { dependencyContext };
	if (forcedVersionRange) return forcedVersionRange === versionRange ? null : forcedVersionRange;
	return resolveUpdatedVersionRange(dependencyContext);
};

const updatePackageJsonDependencyVersion = (dependencyContext, options) => {
	const newVersion = resolveVersionUpdate(dependencyContext, options);
	if (!newVersion) return null;
	const { name, dependentContext: { path, packageJson } } = dependencyContext;
	resolveDependenciesSection(dependencyContext)[name] = newVersion;
	return updatePackageJson(path, packageJson);
};

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependentContext, versionRange: forcedVersionRange } = dependencyContext;
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

	if (!inputOptions.noSave) {
		await updatePackageJsonDependencyVersion(dependencyContext, { forcedVersionRange });
	}

	ongoing.delete(name);
	progressData.emit("end", dependentContext);
};
