"use strict";

const log = require("log").get("npm-cross-link");

module.exports = async (dependencyContext, { toBeCopiedDependencies }) => {
	const { name, dependentContext, externalContext } = dependencyContext;
	const { latestHasPeers } = externalContext;
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
	return true;
};
