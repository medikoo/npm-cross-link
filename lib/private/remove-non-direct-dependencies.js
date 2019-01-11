"use strict";

const { resolve } = require("path")
    , log         = require("log").get("npm-cross-link")
    , readdir     = require("fs2/readdir")
    , rm          = require("fs2/rm");

module.exports = async ({ name, path, dependencies }, { userDependencies }) => {
	const allowedPaths = new Set(
		[".", "..", ".bin"].concat(
			Array.from(dependencies)
				.concat(userDependencies)
				.map(dependencyName => dependencyName.split("/")[0])
		)
	);
	const packageNodeModulesPath = resolve(path, "node_modules");
	return Promise.all(
		(await readdir(packageNodeModulesPath)).map(dependencyPath => {
			if (allowedPaths.has(dependencyPath)) return null;
			log.info("in %s remove unexpected dependency %s", name, dependencyPath);
			return rm(resolve(packageNodeModulesPath, dependencyPath), {
				force: true,
				loose: true,
				recursive: true
			});
		})
	);
};
