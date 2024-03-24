"use strict";

const { resolve }     = require("path")
    , log             = require("log").get("npm-cross-link")
    , installExternal = require("./install-external")
    , setupLocal      = require("./setup-local")
    , resolveLogLevel = require("./resolve-log-level")
    , isSemVerRange   = require("../utils/is-sem-ver-range");

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

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependentContext, name, isExternal } = dependencyContext;

	dependencyContext.path = resolve(dependentContext.path, "node_modules", name);

	const packageJsonVersionRange = getVersionRange(dependencyContext);
	dependencyContext.packageJsonVersionRange = packageJsonVersionRange;
	if (!dependencyContext.versionRange) dependencyContext.versionRange = packageJsonVersionRange;
	const { versionRange } = dependencyContext;
	if (versionRange) {
		dependencyContext.isSemVerVersionRange = isSemVerRange(dependencyContext.versionRange);
		if (!dependencyContext.isSemVerVersionRange) {
			log[resolveLogLevel(dependentContext, progressData)](
				"%s references %s not by semver range %s", dependentContext.name, name, versionRange
			);
		}
	}
	if (!packageJsonVersionRange && inputOptions.noSave) {
		log.warn("%s doesn't reference %s as dependency", dependentContext.name, name);
	}

	if (isExternal) return installExternal(dependencyContext, userConfiguration, progressData);
	return setupLocal(dependencyContext, userConfiguration, inputOptions, progressData);
};
