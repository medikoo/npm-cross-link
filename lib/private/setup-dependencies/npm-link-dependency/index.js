"use strict";

const { resolve }       = require("path")
    , log               = require("log4").get("dev-package")
    , isSymlink         = require("fs2/is-symlink")
    , rm                = require("fs2/rm")
    , getNpmModulesPath = require("../../../get-npm-modules-path")
    , runProgram        = require("../../../run-program")
    , setupExternal     = require("./setup-external");

module.exports = async (dependencyContext, progressData) => {
	const { dependentName, dependentPath, dependencyName, isExternal } = dependencyContext;
	const dependencyPath = (dependencyContext.dependencyPath = resolve(
		dependentPath, "node_modules", dependencyName
	));

	const linkedPath = (dependencyContext.linkedPath = resolve(
		await getNpmModulesPath(), dependencyName
	));

	if (isExternal) {
		await setupExternal(dependencyContext, progressData);
		return;
	}

	if (await isSymlink(dependencyPath, { linkPath: linkedPath })) return;
	log.info("%s link dependency %s", dependentName, dependencyName);
	await rm(dependencyPath, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", dependencyName], {
		cwd: dependentPath,
		logger: log.levelRoot.get("npm:link")
	});
};
