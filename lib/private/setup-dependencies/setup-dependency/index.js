"use strict";

const { resolve }       = require("path")
    , log               = require("log").get("npm-cross-link")
    , semver            = require("semver")
    , getNpmModulesPath = require("../../../get-npm-modules-path")
    , setupExternal     = require("./npm-link-dependency/setup-external")
    , setupLocal        = require("./npm-link-dependency/setup-local");

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
	return dependentContext.packageJson.optionalDependencies[name];
};

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependentContext, name, isExternal } = dependencyContext;
	const { done, ongoing } = progressData;
	if (!isExternal) {
		// If it's local ensure we have it installed locally
		if (!ongoing.has(name) && !done.has(name)) {
			// Cyclic module dependency, hence required on spot
			await require("../../install-package")(
				{ name }, userConfiguration, inputOptions, progressData
			);
		}
		const dependencyInstallationJobs = (done.get(name) || ongoing.get(name)).installationJobs;
		if (dependencyInstallationJobs.size) {
			dependentContext.installationJobs.add(
				`${ dependencyInstallationJobs.has("clone") ? "install" : "update" }-dependency:${
					name
				}`
			);
		}
	}

	dependencyContext.path = resolve(dependentContext.path, "node_modules", name);
	dependencyContext.linkedPath = resolve(await getNpmModulesPath(), name);

	const versionRange = (dependencyContext.versionRange = getVersionRange(dependencyContext));
	const isVersionRangeValid = semver.validRange(versionRange);
	if (!isVersionRangeValid) {
		log.warning(
			"%s references %s not by semver range %s", dependentContext.name, name, versionRange
		);
	}

	if (isExternal) setupExternal(dependencyContext, progressData);
	else setupLocal(dependencyContext, progressData);
};
