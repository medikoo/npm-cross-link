"use strict";

const log                      = require("log").get("npm-cross-link")
    , getPackageJson           = require("../../get-package-json")
    , setupDependency          = require("../setup-dependency")
    , resolveDependencyContext = require("../resolve-dependency-context");

const processDependency = (
	packageContext,
	dependencyName,
	userConfiguration,
	inputOptions,
	progressData,
	isOptional
) => {
	const { name, dependenciesContext } = packageContext;
	log.info("for %s setup dependency %o", name, dependencyName);
	const dependencyContext = {
		...resolveDependencyContext(packageContext, dependencyName, userConfiguration),
		isOptional
	};
	dependenciesContext.set(dependencyName, dependencyContext);
	return setupDependency(dependencyContext, userConfiguration, inputOptions, progressData);
};

const setupRequiredDependencies = async (
	packageContext,
	userConfiguration,
	inputOptions,
	progressData
) => {
	const { name, packageJson } = packageContext;
	const dependencies = (packageContext.dependencies = new Set(
		Object.keys(packageJson.dependencies || {}).concat(
			Object.keys(packageJson.devDependencies || {})
		)
	));
	dependencies.delete(name);
	if (!dependencies.size) return;

	log.debug("for %s setup required dependencies %o", name, dependencies);
	for (const dependencyName of dependencies) {
		await processDependency(
			packageContext, dependencyName, userConfiguration, inputOptions, progressData
		);
	}
};

const setupOptionalDependencies = async (
	packageContext,
	userConfiguration,
	inputOptions,
	progressData
) => {
	const { dependencies, name, packageJson } = packageContext;

	const optionalDependencies = new Set(
		Object.keys(packageJson.optionalDependencies || {}).filter(
			dependencyName => dependencyName !== name && !dependencies.has(dependencyName)
		)
	);
	if (!optionalDependencies.size) return;
	for (const dependencyName of optionalDependencies) dependencies.add(dependencyName);

	log.info("for %s setup optional dependencies %o", name, dependencies);
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
