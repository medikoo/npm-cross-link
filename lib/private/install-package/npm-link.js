"use strict";

const { resolve }       = require("path")
    , log               = require("log").get("npm-cross-link")
    , isSymlink         = require("fs2/is-symlink")
    , rm                = require("fs2/rm")
    , cleanupNpmInstall = require("../cleanup-npm-install")
    , getNpmModulesPath = require("../../get-npm-modules-path")
    , runProgram        = require("../../run-program");

module.exports = async packageContext => {
	const { path, name, installationJobs } = packageContext;
	const symlinkPath = resolve(await getNpmModulesPath(), name);
	if (await isSymlink(symlinkPath, { linkPath: path })) return;

	installationJobs.add("link");

	await Promise.all([
		rm(symlinkPath, { loose: true, recursive: true, force: true }),
		// If there are linked packages in node_modules `npm link` tends to =
		// mess with its dependencies. To avoid that node_modules is removed prior linking
		rm(resolve(path, "node_modules"), { loose: true, recursive: true, force: true })
	]);

	log.info("link %s", name);
	try {
		await runProgram("npm", ["link"], { cwd: path, logger: log.levelRoot.get("npm:link") });
	} catch (error) {
		await cleanupNpmInstall(packageContext);
		if (await isSymlink(symlinkPath, { linkPath: path })) {
			log.warn("npm crashed, still link was created so that's ignored");
		} else {
			throw error;
		}
	}

	// Remove node_modules so it doesn't give false hints to future installation steps
	await rm(resolve(path, "node_modules"), { loose: true, recursive: true, force: true });
};
