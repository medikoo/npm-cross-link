"use strict";

const { basename, resolve } = require("path")
    , logger                = require("log4").get("setup-own-package")
    , isSymbolicLink        = require("./is-symbolic-link")
    , rmPath                = require("./rm-path")
    , runProgram            = require("./run-program");

module.exports = async (packagePath, dependencyName) => {
	const dependencyLinkPath = resolve(packagePath, "node_modules", dependencyName);
	if (await isSymbolicLink(dependencyLinkPath)) return;
	logger.notice("link %s in %s", dependencyName, basename(packagePath));
	await rmPath(dependencyLinkPath);
	await runProgram("npm", ["link", dependencyName], {
		cwd: packagePath,
		logger: logger.levelRoot.get("npm:link")
	});
};
