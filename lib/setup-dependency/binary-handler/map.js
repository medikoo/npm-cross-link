"use strict";

const { join, resolve }   = require("path")
    , resolveBinariesDict = require("../../resolve-package-binaries-dict")
    , binaryHandler       = require("./");

module.exports = async ({ name, path, dependentContext }) => {
	const binDict = resolveBinariesDict(path);
	if (!binDict) return;
	await Promise.all(
		Object.entries(binDict).map(async ([targetName, linkedPath]) => {
			await binaryHandler.set(
				join("../", name, linkedPath),
				resolve(dependentContext.path, "node_modules/.bin", targetName)
			);
		})
	);
};
