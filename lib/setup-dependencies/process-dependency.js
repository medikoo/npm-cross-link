"use strict";

const log                      = require("log").get("npm-cross-link")
    , resolveDependencyContext = require("../resolve-dependency-context")
    , setupDependency          = require("../setup-dependency");

module.exports = (
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
		isOptional,
	};
	dependenciesContext.set(dependencyName, dependencyContext);
	return setupDependency(dependencyContext, userConfiguration, inputOptions, progressData);
};
