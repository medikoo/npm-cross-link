"use strict";

const { resolve } = require("path")
    , isDirectory = require("fs2/is-directory");

module.exports = async ({ path }, dependencyPackageJson) =>
	(
		await Promise.all(
			Object.keys(dependencyPackageJson.dependencies || {}).map(packageName =>
				isDirectory(resolve(path, "node_modules", packageName))
			)
		)
	).every(Boolean);
