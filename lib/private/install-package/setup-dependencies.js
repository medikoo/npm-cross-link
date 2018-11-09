"use strict";

const { resolve }  = require("path")
    , log          = require("log4").get("dev-package")
    , setupNpmLink = require("./setup-npm-link");

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
			ongoingMap.get(dependencyName).push(() => setupNpmLink(dependencyContext));
			return;
		}
		if (!done.has(dependencyName)) {
			// Cyclical dependncy, hence required on spot
			await require("./")(
				{ name: dependencyName }, userConfiguration, inputOptions, progressData
			);
		}
	}
	await setupNpmLink(dependencyContext);
};

const resolveDependencyContext = (context, dependencyName, configuration) => {
	const { name, path } = context;
	const { packagesMeta } = configuration;
	return {
		dependentName: name,
		dependentPath: path,
		dependencyName,
		isExternal: !packagesMeta[dependencyName]
	};
};

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { name, path } = packageContext;
	const pkgJson = (packageContext.pkgJson = require(resolve(path, "package.json")));
	const dependencies = (packageContext.dependencies = new Set(
		Object.keys(pkgJson.dependencies || {}).concat(Object.keys(pkgJson.devDependencies || {}))
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
	for (const dependencyName of Object.keys(pkgJson.optionalDependencies || {})) {
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
		try { await setupNpmLink(dependencyContext); }
		catch (error) {
			log.error(
				`Could not link optional dependency %s, crashed with:\n${ error.stack }`,
				dependencyName
			);
		}
	}
};
