"use strict";

const log            = require("log4").get("dev-package")
    , getPackageJson = require("../get-package-json")
    , npmLink        = require("./npm-link-dependency");

const setupDependency = async (
	dependencyContext,
	userConfiguration,
	inputOptions,
	progressData
) => {
	const { dependencyName, isExternal } = dependencyContext;
	const { done, ongoingMap } = progressData;
	if (!isExternal) {
		if (ongoingMap.has(dependencyName)) {
			ongoingMap.get(dependencyName).push(() => npmLink(dependencyContext, progressData));
			return;
		}
		if (!done.has(dependencyName)) {
			// Cyclical dependncy, hence required on spot
			await require("..")(
				{ name: dependencyName }, userConfiguration, inputOptions, progressData
			);
		}
	}
	await npmLink(dependencyContext, progressData);
};

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
		const dependencyContext = resolveDependencyContext(
			packageContext, dependencyName, userConfiguration
		);
		if (dependencyContext.isExternal) {
			await setupDependency(dependencyContext, userConfiguration, inputOptions);
			continue;
		}
		try { await npmLink(dependencyContext, progressData); }
		catch (error) {
			log.error(
				`Could not link optional dependency %s, crashed with:\n${ error.stack }`,
				dependencyName
			);
		}
	}
};

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { path } = packageContext;
	const packageJson = (packageContext.packageJson = getPackageJson(path));
	if (!packageJson) return;

	await setupRequiredDependencies(packageContext, userConfiguration, inputOptions, progressData);

	await setupOptionalDependencies(packageContext, userConfiguration, inputOptions, progressData);
};
