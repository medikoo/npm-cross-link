"use strict";

const log = require("log4").get("dev-package");

module.exports = async (dependencyContext, operation) => {
	try {
		return await operation();
	} catch (error) {
		const { isOptional, dependencyName, dependent } = dependencyContext;
		if (isOptional) {
			log.warn(
				"%s optional %s dependency failed to install (ignoring): %#s", dependent.name,
				dependencyName, error.stack
			);
			return null;
		}
		throw error;
	}
};
