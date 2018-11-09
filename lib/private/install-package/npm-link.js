"use strict";

const { resolve }       = require("path")
    , log               = require("log4").get("npm-cross-link")
    , isSymlink         = require("fs2/is-symlink")
    , rm                = require("fs2/rm")
    , cleanupNpmInstall = require("../cleanup-npm-install")
    , getNpmModulesPath = require("../../get-npm-modules-path")
    , runProgram        = require("../../run-program");

module.exports = async packageContext => {
	const { path, name } = packageContext;
	const symlinkPath = resolve(await getNpmModulesPath(), name);
	if (await isSymlink(symlinkPath, { linkPath: path })) return;
	await rm(symlinkPath, { loose: true, recursive: true, force: true });
	log.info("link %s", name);
	try {
		await runProgram("npm", ["link"], { cwd: path, logger: log.levelRoot.get("npm:link") });
	} catch (error) {
		await cleanupNpmInstall(packageContext);
		if (await isSymlink(symlinkPath, { linkPath: path })) {
			log.warning("npm crashed, still link was created so that's ignored");
			return;
		}

		throw error;
	}
};
