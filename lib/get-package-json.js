"use strict";

const ensureString          = require("es5-ext/object/validate-stringifiable-value")
    , { resolve }           = require("path")
    , log                   = require("log").get("npm-cross-link")
    , isModuleNotFoundError = require("cjs-module/is-module-not-found-error");

module.exports = path => {
	const packageMetaPath = resolve(ensureString(path), "package.json");
	try {
		return require(packageMetaPath);
	} catch (error) {
		if (!isModuleNotFoundError(error, packageMetaPath)) {
			log.error("resolving package.json at %s crashed with: %#s", path, error.message);
		}
		return null;
	}
};
