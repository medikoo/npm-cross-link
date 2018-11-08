"use strict";

const { resolve }       = require("path")
    , log               = require("log4").get("dev-package")
    , isSymlink         = require("fs2/is-symlink")
    , rm                = require("fs2/rm")
    , getNpmModulesPath = require("../../../../get-npm-modules-path")
    , runProgram        = require("../../../../run-program")
    , setupExternal     = require("./setup-external");

module.exports = async (dependencyContext, progressData) => {
	const { dependent, name, isExternal } = dependencyContext;
	const path = (dependencyContext.path = resolve(dependent.path, "node_modules", name));

	const linkedPath = (dependencyContext.linkedPath = resolve(await getNpmModulesPath(), name));

	if (isExternal) {
		await setupExternal(dependencyContext, progressData);
		return;
	}

	if (await isSymlink(path, { linkPath: linkedPath })) return;
	log.info("%s link dependency %s", dependent.name, name);
	await rm(path, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", name], {
		cwd: dependent.path,
		logger: log.levelRoot.get("npm:link")
	});
};
