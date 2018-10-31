"use strict";

const log            = require("log4").get("dev-package")
    , getPackageJson = require("./get-package-json")
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
			ongoingMap.get(dependencyName).push(() => npmLink(dependencyContext));
			return;
		}
		if (!done.has(dependencyName)) {
			// Cyclical dependncy, hence required on spot
			await require("./")(
				{ name: dependencyName }, userConfiguration, inputOptions, progressData
			);
		}
	}
	await npmLink(dependencyContext);
};

const resolveDependencyContext = (packageContext, dependencyName, userConfiguration) => {
	const { name, path } = packageContext;
	const { packagesMeta } = userConfiguration;
	return {
		dependentName: name,
		dependentPath: path,
		dependencyName,
		isExternal: !packagesMeta[dependencyName]
	};
};

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { name, path } = packageContext;
	const packageJson = (packageContext.pkgJson = getPackageJson(path));
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

	// Eventual optional dependencies
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
		try { await npmLink(dependencyContext); }
		catch (error) {
			log.error(
				`Could not link optional dependency %s, crashed with:\n${ error.stack }`,
				dependencyName
			);
		}
	}
};
