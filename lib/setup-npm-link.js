"use strict";

const { basename, resolve } = require("path")
    , log                   = require("log4").get("dev-package")
    , rm                    = require("fs2/rm")
    , getNpmModulesPath     = require("./get-npm-modules-path")
    , isValidSymlink        = require("./is-valid-symlink")
    , runProgram            = require("./run-program");

module.exports = async (packagePath, dependencyName) => {
	const dependencyLinkPath = resolve(packagePath, "node_modules", dependencyName);
	const linkedPath = resolve(await getNpmModulesPath(), dependencyName);
	if (await isValidSymlink(dependencyLinkPath, linkedPath)) return;
	log.info("link %s in %s", dependencyName, basename(packagePath));
	await rm(dependencyLinkPath, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", dependencyName], {
		cwd: packagePath,
		logger: log.levelRoot.get("npm:link")
	});
};
