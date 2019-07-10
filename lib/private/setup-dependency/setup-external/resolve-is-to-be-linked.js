"use strict";

const log                     = require("log").get("npm-cross-link")
    , resolveExternalContext  = require("../../resolve-external-context")
    , nonOverridableExternals = require("../../non-overridable-externals")
    , installExternal         = require("../install-external")
    , resolveLogLevel         = require("../resolve-log-level");

module.exports = async (dependencyContext, { toBeCopiedDependencies }, progressData) => {
	const { name, dependentContext, versionRange, isSemVerVersionRange } = dependencyContext;
	if (versionRange && !isSemVerVersionRange) {
		await installExternal(dependencyContext);
		return false;
	}
	const externalContext = await resolveExternalContext(dependencyContext, progressData);
	const { latestVersion, latestHasPeers } = externalContext;
	if (nonOverridableExternals.has(name)) {
		log.info(
			"%s will have %s installed on spot, " +
				"as it's marked as non-overridable for global install",
			dependentContext.name, name
		);
		return false;
	}
	if (toBeCopiedDependencies.has(name)) {
		log.info(
			"%s will have %s installed on spot, " +
				"as it's marked as one of \"to be copied\" dependencies in user config",
			dependentContext.name, name
		);
		return false;
	}

	if (latestHasPeers) {
		log.info(
			"%s will have %s installed on spot, as it lists peer dependencies",
			dependentContext.name, name
		);
		return false;
	}
	const { latestSupportedPublishedVersion } = dependencyContext;
	if (!latestSupportedPublishedVersion) {
		log.error(
			"%s references %s by %s version range, which doesn't mach any published one",
			dependentContext.name, name, versionRange
		);
	} else if (latestSupportedPublishedVersion !== latestVersion) {
		// Latest version not supported, therefore dependency is installed directly (not linked)
		log[resolveLogLevel(dependentContext, progressData)](
			"%s references %s by %s version range, which doesn't match the latest",
			dependentContext.name, name, versionRange
		);
		// Expects outdated version, therefore do not link but install in place (if needed)
		return false;
	}
	return true;
};
