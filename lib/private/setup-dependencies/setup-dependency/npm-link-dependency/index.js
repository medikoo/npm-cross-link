"use strict";

const { resolve }       = require("path")
    , log               = require("log4").get("dev-package")
    , isSymlink         = require("fs2/is-symlink")
    , rm                = require("fs2/rm")
    , getNpmModulesPath = require("../../../../get-npm-modules-path")
    , runProgram        = require("../../../../run-program")
    , setupExternal     = require("./setup-external");

module.exports = async (dependencyContext, progressData) => {
	const { dependent, dependency, isExternal } = dependencyContext;
	dependency.path = resolve(dependent.path, "node_modules", dependency.name);

	const linkedPath = (dependencyContext.linkedPath = resolve(
		await getNpmModulesPath(), dependency.name
	));

	if (isExternal) {
		await setupExternal(dependencyContext, progressData);
		return;
	}

	if (await isSymlink(dependency.path, { linkPath: linkedPath })) return;
	log.info("%s link dependency %s", dependent.name, dependency.name);
	await rm(dependency.path, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", dependency.name], {
		cwd: dependent.path,
		logger: log.levelRoot.get("npm:link")
	});
};
