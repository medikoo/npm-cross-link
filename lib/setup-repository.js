"use strict";

const isObject    = require("es5-ext/object/is-object")
    , log         = require("log4").get("dev-package")
    , isDirectory = require("./is-directory")
    , runProgram  = require("./run-program");

module.exports = async ({ path, meta: { repoUrl } }, options = {}) => {
	if (!isObject(options)) options = {};
	if (await isDirectory(path)) {
		if (options.skipGitUpdate) return;
		// Confirm directory is clean
		const { stdout } = await runProgram("git", ["status", "--porcelain"], { cwd: path });
		if (stdout) throw new Error(`Repository ${ path } is not clean:\n${ stdout }`);

		// Update
		log.info("update repository %s", path);
		await runProgram("git", ["pull"], { cwd: path, logger: log.levelRoot.get("git:pull") });
		return;
	}
	log.info("clone repository %s from %s", path, repoUrl);
	await runProgram("git", ["clone", repoUrl, path], { logger: log.levelRoot.get("git:clone") });
};
