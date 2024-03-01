"use strict";

const { join, resolve }   = require("path")
    , isDirectory         = require("fs2/is-directory")
    , resolveBinariesDict = require("../../resolve-package-binaries-dict")
    , binaryHandler       = require("./binary-handler");

module.exports = async ({ path, dependentContext, name }, dependencyPackageJson) => {
	const binDict = resolveBinariesDict(path);
	return (
		await Promise.all([
			...Object.keys(dependencyPackageJson.dependencies || {}).map(packageName =>
				isDirectory(resolve(path, "node_modules", packageName))
			),
			...Object.entries(binDict || {}).map(async ([targetName, linkedPath]) => {
				const targetPath = resolve(dependentContext.path, "node_modules/.bin", targetName);
				return binaryHandler.has(join("../", name, linkedPath), targetPath);
			})
		])
	).every(Boolean);
};
