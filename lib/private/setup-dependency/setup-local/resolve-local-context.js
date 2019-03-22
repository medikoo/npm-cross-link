"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , { resolve }      = require("path")
    , log              = require("log").get("npm-cross-link")
    , getPackageJson   = require("../../../get-package-json");

module.exports = (dependencyContext, { packagesPath }, { locals }) => {
	const { name } = dependencyContext;
	if (!locals.has(name)) {
		locals.set(name, {
			localVersion:
				optionalChaining(getPackageJson(resolve(packagesPath, name)), "version") || null
		});
		log.debug("resolved %s (local dependency) meta %o", name, locals.get(name));
	}
	return (dependencyContext.localContext = locals.get(name));
};
