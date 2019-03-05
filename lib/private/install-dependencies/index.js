"use strict";

const optionalChaining           = require("es5-ext/optional-chaining")
    , { resolve }                = require("path")
    , wait                       = require("timers-ext/promise/sleep")
    , cleanupNpmInstall          = require("../cleanup-npm-install")
    , setupDependency            = require("../setup-dependency")
    , resolveUpdatedVersionRange = require("../resolve-updated-version-range")
    , updatePackageJson          = require("../update-package-json")
    , entriesToOrderedKeysObject = require("../entries-to-ordered-keys-object")
    , resolveDependencyContext   = require("../resolve-dependency-context")
    , addPackageJsonSection      = require("./add-package-json-section");

const resolveDependenciesSectionName = (dependencyContext, inputOptions) => {
	const { name, dependentContext: { packageJson } } = dependencyContext;
	if (optionalChaining(packageJson.dependencies, name)) return "dependencies";
	if (optionalChaining(packageJson.devDependencies, name)) return "devDependencies";
	if (optionalChaining(packageJson.optionalDependencies, name)) return "optionalDependencies";
	switch (inputOptions.saveMode) {
		case "dev":
			return "devDependencies";
		case "optional":
			return "optionalDependencies";
		default:
			return "dependencies";
	}
};

const resolveVersionUpdate = (dependencyContext, { forcedVersionRange }) => {
	const versionRange = { dependencyContext };
	if (forcedVersionRange) return forcedVersionRange === versionRange ? null : forcedVersionRange;
	return resolveUpdatedVersionRange(dependencyContext);
};

const updatePackageJsonDependencyVersion = (dependencyContext, inputOptions, options) => {
	const newVersion = resolveVersionUpdate(dependencyContext, options);
	if (!newVersion) return null;
	const { name, dependentContext: { path, packageJson } } = dependencyContext;
	const dependenciesSectionName = resolveDependenciesSectionName(dependencyContext, inputOptions);
	if (!packageJson[dependenciesSectionName]) {
		updatePackageJson(
			path,
			addPackageJsonSection(packageJson, dependenciesSectionName, { [name]: newVersion })
		);
		return null;
	}
	packageJson[dependenciesSectionName][name] = newVersion;
	packageJson[dependenciesSectionName] = entriesToOrderedKeysObject(
		Object.entries(packageJson[dependenciesSectionName])
	);
	return updatePackageJson(path, packageJson);
};

module.exports = async (
	dependentContext,
	dependenciesData,
	userConfiguration,
	inputOptions,
	progressData
) => {
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

	for (const { name: dependencyName, versionRange } of dependenciesData) {
		const dependencyContext = resolveDependencyContext(
			dependentContext, dependencyName, userConfiguration
		);
		if (versionRange) dependencyContext.versionRange = versionRange;
		await setupDependency(dependencyContext, userConfiguration, inputOptions, progressData);
		if (!inputOptions.noSave) {
			await updatePackageJsonDependencyVersion(dependencyContext, inputOptions, {
				versionRange
			});
		}
	}

	ongoing.delete(name);
	progressData.emit("end", dependentContext);
};
