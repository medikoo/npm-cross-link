"use strict";

const log                       = require("log").get("npm-cross-link")
    , getPackageJson            = require("../get-package-json")
    , processDependency         = require("./process-dependency")
    , setupRequiredDependencies = require("./setup-required-dependencies");

const setupOptionalDependencies = async (
	packageContext,
	userConfiguration,
	inputOptions,
	progressData
) => {
	const { dependencies, name, packageJson } = packageContext;
	const { installMode } = inputOptions;
	const { topPackageName } = progressData;

	const optionalDependencies = new Set(
		Object.keys(packageJson.optionalDependencies || {}).filter(
			dependencyName => dependencyName !== name && !dependencies.has(dependencyName)
		)
	);
	if (!optionalDependencies.size) return;
	for (const dependencyName of optionalDependencies) dependencies.add(dependencyName);

	if (topPackageName === name && installMode === "dev") return;
	log.info("for %s setup optional dependencies %o", name, optionalDependencies);
	for (const dependencyName of optionalDependencies) {
		await processDependency(
			packageContext, dependencyName, userConfiguration, inputOptions, progressData, true
		);
	}
};

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { path } = packageContext;
	if (!packageContext.packageJson) packageContext.packageJson = getPackageJson(path);
	const { packageJson } = packageContext;
	if (!packageJson) return;

	packageContext.dependenciesContext = new Map();

	await setupRequiredDependencies(packageContext, userConfiguration, inputOptions, progressData);

	await setupOptionalDependencies(packageContext, userConfiguration, inputOptions, progressData);
};
