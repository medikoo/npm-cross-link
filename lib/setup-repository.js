"use strict";

const isObject    = require("es5-ext/object/is-object")
    , log         = require("log4").get("dev-package")
    , isDirectory = require("./is-directory")
    , runProgram  = require("./run-program");

module.exports = async (repoPath, repoUrl, options = {}) => {
	if (!isObject(options)) options = {};
	if (await isDirectory(repoPath)) {
		if (options.skipGitUpdate) return;
		// Confirm directory is clean
		const { stdout } = await runProgram("git", ["status", "--porcelain"], { cwd: repoPath });
		if (stdout) throw new Error(`Repository ${ repoPath } is not clean:\n${ stdout }`);

		// Update
		log.info("update repository %s", repoPath);
		await runProgram("git", ["pull"], { cwd: repoPath, logger: log.levelRoot.get("git:pull") });
		return;
	}
	log.info("clone repository %s from %s", repoPath, repoUrl);
	await runProgram("git", ["clone", repoUrl, repoPath], {
		logger: log.levelRoot.get("git:clone")
	});
};
