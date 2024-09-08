"use strict";

const { join, resolve }   = require("path")
    , resolveBinariesDict = require("../../resolve-package-binaries-dict")
    , binaryHandler       = require("./");

module.exports = async ({ path, dependentContext, name }) => {
	const binDict = resolveBinariesDict(path);
	return (
		await Promise.all(
			Object.entries(binDict || {}).map(async ([targetName, linkedPath]) => {
				const targetPath = resolve(dependentContext.path, "node_modules/.bin", targetName);
				return binaryHandler.has(join("../", name, linkedPath), targetPath);
			})
		)
	).every(Boolean);
};
