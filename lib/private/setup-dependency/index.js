"use strict";

const { resolve }       = require("path")
    , log               = require("log").get("npm-cross-link")
    , semver            = require("semver")
    , getNpmModulesPath = require("../../get-npm-modules-path")
    , setupExternal     = require("./setup-external")
    , setupLocal        = require("./setup-local")
    , resolveLogLevel   = require("./resolve-log-level");

const getVersionRange = ({ dependentContext, name }) => {
	if (
		dependentContext.packageJson.dependencies &&
		dependentContext.packageJson.dependencies[name]
	) {
		return dependentContext.packageJson.dependencies[name];
	}
	if (
		dependentContext.packageJson.devDependencies &&
		dependentContext.packageJson.devDependencies[name]
	) {
		return dependentContext.packageJson.devDependencies[name];
	}
	if (
		dependentContext.packageJson.optionalDependencies &&
		dependentContext.packageJson.optionalDependencies[name]
	) {
		return dependentContext.packageJson.optionalDependencies[name];
	}
	return null;
};

const isSemVerValidRange = versionRange => {
	if (versionRange === "latest") return true;
	return semver.validRange(versionRange);
};

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependentContext, name, isExternal } = dependencyContext;

	dependencyContext.path = resolve(dependentContext.path, "node_modules", name);
	dependencyContext.linkedPath = resolve(await getNpmModulesPath(), name);

	const packageJsonVersionRange = getVersionRange(dependencyContext);
	dependencyContext.packageJsonVersionRange = packageJsonVersionRange;
	if (!dependencyContext.versionRange) dependencyContext.versionRange = packageJsonVersionRange;
	const { versionRange } = dependencyContext;
	if (versionRange) {
		dependencyContext.isSemVerVersionRange = isSemVerValidRange(dependencyContext.versionRange);
		if (!dependencyContext.isSemVerVersionRange) {
			log[resolveLogLevel(dependentContext, progressData)](
				"%s references %s not by semver range %s", dependentContext.name, name, versionRange
			);
		}
	} else if (inputOptions.noSave) {
		log.warn("%s doesn't reference %s as dependency", dependentContext.name, name);
	}

	if (isExternal) return setupExternal(dependencyContext, progressData);
	return setupLocal(dependencyContext, userConfiguration, inputOptions, progressData);
};
