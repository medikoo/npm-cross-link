"use strict";

const wait                           = require("timers-ext/promise/sleep")
    , cleanupNpmInstall              = require("../cleanup-npm-install")
    , setupDependency                = require("../setup-dependency")
    , resolveUpdatedVersionRange     = require("../resolve-updated-version-range")
    , updatePackageJson              = require("../update-package-json")
    , entriesToOrderedKeysObject     = require("../entries-to-ordered-keys-object")
    , resolveDependencyContext       = require("../resolve-dependency-context")
    , resolveMaintainedPackagePath   = require("../resolve-maintained-package-path")
    , addPackageJsonSection          = require("./add-package-json-section")
    , resolveDependenciesSectionName = require("./resolve-dependencies-section-name");

const updatePackageJsonDependencyVersion = (dependencyContext, inputOptions) => {
	const { currentPackageJsonSectionName, targetPackageJsonSectionName } =
		resolveDependenciesSectionName(dependencyContext, inputOptions);
	const newVersion = resolveUpdatedVersionRange(dependencyContext);
	if (!newVersion && currentPackageJsonSectionName === targetPackageJsonSectionName) return null;
	const { name, dependentContext: { path, packageJson } } = dependencyContext;
	if (
		currentPackageJsonSectionName &&
		currentPackageJsonSectionName !== targetPackageJsonSectionName
	) {
		delete packageJson[currentPackageJsonSectionName][name];
	}
	if (!packageJson[targetPackageJsonSectionName]) {
		updatePackageJson(
			path,
			addPackageJsonSection(packageJson, targetPackageJsonSectionName, { [name]: newVersion })
		);
		return null;
	}
	packageJson[targetPackageJsonSectionName][name] = newVersion;
	packageJson[targetPackageJsonSectionName] = entriesToOrderedKeysObject(
		Object.entries(packageJson[targetPackageJsonSectionName])
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
	const { packagesMeta } = userConfiguration;
	const { ongoing } = progressData;

	if (packagesMeta[name] && resolveMaintainedPackagePath(name, userConfiguration) !== path) {
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
		if (versionRange) {
			dependencyContext.forcedVersionRange = dependencyContext.versionRange = versionRange;
		}
		await setupDependency(dependencyContext, userConfiguration, inputOptions, progressData);
		if (!inputOptions.noSave) {
			await updatePackageJsonDependencyVersion(dependencyContext, inputOptions);
		}
	}

	ongoing.delete(name);
	progressData.emit("end", dependentContext);
};
