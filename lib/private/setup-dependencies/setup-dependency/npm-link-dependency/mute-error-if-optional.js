"use strict";

const log = require("log").get("npm-cross-link");

module.exports = async (dependencyContext, operation) => {
	try {
		return await operation();
	} catch (error) {
		const { isOptional, name, dependentContext } = dependencyContext;
		if (isOptional) {
			log.warn(
				"%s optional %s dependency failed to install (ignoring): %#s",
				dependentContext.name, name, error.stack
			);
			return null;
		}
		throw error;
	}
};
