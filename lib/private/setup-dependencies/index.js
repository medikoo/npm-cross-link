"use strict";

const log             = require("log4").get("dev-package")
    , getPackageJson  = require("../get-package-json")
    , setupDependency = require("./setup-dependency");

const resolveDependencyContext = (packageContext, name, userConfiguration) => {
	const { packagesMeta } = userConfiguration;
	return { dependent: packageContext, name, isExternal: !packagesMeta[name] };
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

	log.info("for %s setup required dependencies %o", name, dependencies);
	for (const dependencyName of dependencies) {
		log.info("for %s setup required dependency %o", name, dependencyName);
		await setupDependency(
			resolveDependencyContext(packageContext, dependencyName, userConfiguration),
			userConfiguration, inputOptions, progressData
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

	log.info("for %s setup optional dependencies %o", name, dependencies);
	for (const dependencyName of optionalDependencies) {
		dependencies.add(dependencyName);
		log.info("for %s setup optional dependency %o", name, dependencyName);
		await setupDependency(
			{
				...resolveDependencyContext(packageContext, dependencyName, userConfiguration),
				isOptional: true
			},
			userConfiguration, inputOptions, progressData
		);
	}
};

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { path } = packageContext;
	if (!packageContext.packageJson) packageContext.packageJson = getPackageJson(path);
	const { packageJson } = packageContext;
	if (!packageJson) return;

	await setupRequiredDependencies(packageContext, userConfiguration, inputOptions, progressData);

	await setupOptionalDependencies(packageContext, userConfiguration, inputOptions, progressData);
};
