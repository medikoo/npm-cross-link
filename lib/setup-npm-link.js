"use strict";

const { basename, resolve } = require("path")
    , log                   = require("log4").get("dev-package")
    , rm                    = require("fs2/rm")
    , isSymbolicLink        = require("./is-symbolic-link")
    , runProgram            = require("./run-program");

module.exports = async (packagePath, dependencyName) => {
	const dependencyLinkPath = resolve(packagePath, "node_modules", dependencyName);
	if (await isSymbolicLink(dependencyLinkPath)) return;
	log.info("link %s in %s", dependencyName, basename(packagePath));
	await rm(dependencyLinkPath, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", dependencyName], {
		cwd: packagePath,
		logger: log.levelRoot.get("npm:link")
	});
};
