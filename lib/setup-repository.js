"use strict";

const isObject        = require("es5-ext/object/is-object")
    , log             = require("log4").get("dev-package")
    , isDirectory     = require("fs2/is-directory")
    , DevPackageError = require("./dev-package-error")
    , runProgram      = require("./run-program");

module.exports = async (path, repoUrl, options = {}) => {
	if (!isObject(options)) options = {};
	if (await isDirectory(path)) {
		if (options.skipGitUpdate) return false;
		// Confirm directory is clean
		const { stdout } = await runProgram("git", ["status", "--porcelain"], { cwd: path });
		if (stdout) {
			throw new DevPackageError(
				`Cannot proceed with update, repository ${ path } is not clean:\n${
					stdout.split("\n").map(line => `  ${ line }`).join("\n")
				}`
			);
		}

		// Update
		log.info("update repository %s", path);
		await runProgram("git", ["pull"], { cwd: path, logger: log.levelRoot.get("git:pull") });
		return false;
	}
	log.info("clone repository %s from %s", path, repoUrl);
	await runProgram("git", ["clone", repoUrl, path], { logger: log.levelRoot.get("git:clone") });
	return true;
};
