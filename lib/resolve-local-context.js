"use strict";

const optionalChaining             = require("es5-ext/optional-chaining")
    , log                          = require("log").get("npm-cross-link")
    , getPackageJson               = require("./get-package-json")
    , resolveMaintainedPackagePath = require("./resolve-maintained-package-path");

module.exports = (dependencyContext, userConfiguration, { locals }) => {
	const { name } = dependencyContext;
	if (!locals.has(name)) {
		locals.set(name, {
			localVersion:
				optionalChaining(
					getPackageJson(resolveMaintainedPackagePath(name, userConfiguration)), "version"
				) || null,
		});
		log.debug("resolved %s (local dependency) meta %o", name, locals.get(name));
	}
	return (dependencyContext.localContext = locals.get(name));
};
