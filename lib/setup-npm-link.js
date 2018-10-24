"use strict";

const { basename, resolve } = require("path")
    , log                   = require("log4").get("dev-package")
    , rm                    = require("fs2/rm")
    , readlink              = require("fs2/readlink")
    , getNpmModulesPath     = require("./get-npm-modules-path")
    , runProgram            = require("./run-program");

module.exports = async (packagePath, dependencyName) => {
	const dependencyLinkPath = resolve(packagePath, "node_modules", dependencyName);
	const linkedPath = resolve(await getNpmModulesPath(), dependencyName);
	let realLinkedPath = await readlink(dependencyLinkPath, { loose: true });
	if (realLinkedPath) realLinkedPath = resolve(packagePath, "node_modules", realLinkedPath);
	if (realLinkedPath === linkedPath) return;
	log.info("link %s in %s", dependencyName, basename(packagePath));
	await rm(dependencyLinkPath, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", dependencyName], {
		cwd: packagePath,
		logger: log.levelRoot.get("npm:link")
	});
};
