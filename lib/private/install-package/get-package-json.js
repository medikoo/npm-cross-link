"use strict";

const { resolve }           = require("path")
    , isModuleNotFoundError = require("cjs-module/is-module-not-found-error");

module.exports = path => {
	const packageMetaPath = resolve(path, "package.json");
	try {
		return require(packageMetaPath);
	} catch (error) {
		if (isModuleNotFoundError(error, path)) return null;
		throw error;
	}
};
