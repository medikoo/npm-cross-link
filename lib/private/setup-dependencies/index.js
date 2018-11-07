"use strict";

const log             = require("log4").get("dev-package")
    , getPackageJson  = require("../get-package-json")
    , setupDependency = require("./setup-dependency");

const resolveDependencyContext = (packageContext, dependencyName, userConfiguration) => {
	const { name, path } = packageContext;
	const { packagesMeta } = userConfiguration;
	return {
		dependentName: name,
		dependentPath: path,
		dependentPackageJson: packageContext.packageJson,
		dependencyName,
		isExternal: !packagesMeta[dependencyName]
	};
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

	log.info("for %s setup dependencies %o", name, dependencies);
	for (const dependencyName of dependencies) {
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

	for (const dependencyName of Object.keys(packageJson.optionalDependencies || {})) {
		if (dependencyName === name) continue;
		if (dependencies.has(dependencyName)) continue;
		dependencies.add(dependencyName);
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
	const packageJson = (packageContext.packageJson = getPackageJson(path));
	if (!packageJson) return;

	await setupRequiredDependencies(packageContext, userConfiguration, inputOptions, progressData);

	await setupOptionalDependencies(packageContext, userConfiguration, inputOptions, progressData);
};
