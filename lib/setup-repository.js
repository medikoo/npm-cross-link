"use strict";

const log         = require("log4").get("dev-package")
    , isDirectory = require("./is-directory")
    , runProgram  = require("./run-program");

module.exports = async (repoPath, repoUrl) => {
	if (await isDirectory(repoPath)) {
		// Confirm directory is clean
		const { stdout } = await runProgram("git", ["status", "--porcelain"], { cwd: repoPath });
		if (stdout) throw new Error(`Repository ${ repoPath } is not clean:\n${ stdout }`);

		// Update
		log.notice("update repository %s", repoPath);
		await runProgram("git", ["pull"], { cwd: repoPath, logger: log.levelRoot.get("git:pull") });
		return;
	}
	log.notice("clone repository %s from %s", repoPath, repoUrl);
	await runProgram("git", ["clone", repoUrl, repoPath], {
		logger: log.levelRoot.get("git:clone")
	});
};
