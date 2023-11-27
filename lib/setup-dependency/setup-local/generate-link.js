"use strict";

const rm         = require("fs2/rm")
    , log        = require("log").get("npm-cross-link")
    , runProgram = require("../../run-program");

module.exports = async dependencyContext => {
	const { dependentContext, name, path } = dependencyContext;
	log.info("%s link dependency %s", dependentContext.name, name);
	await rm(path, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", "--force", name], {
		cwd: dependentContext.path,
		logger: log.levelRoot.get("npm:link")
	});
};
