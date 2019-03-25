"use strict";

const ensureString     = require("es5-ext/object/validate-stringifiable-value")
    , { resolve }      = require("path")
    , { readFileSync } = require("fs")
    , log              = require("log").get("npm-cross-link");

module.exports = path => {
	const packageMetaPath = resolve(ensureString(path), "package.json");
	try {
		return JSON.parse(readFileSync(packageMetaPath));
	} catch (error) {
		if (error.code !== "ENOENT") {
			log.error("resolving package.json at %s crashed with: %#s", path, error.message);
		}
		return null;
	}
};
