"use strict";

const logger      = require("log4").get("dev-package-install")
    , isDirectory = require("./is-directory")
    , runProgram  = require("./run-program");

module.exports = async (repoPath, repoUrl) => {
	if (await isDirectory(repoPath)) {
		// Confirm directory is clean
		const { stdout } = await runProgram("git", ["status", "--porcelain"], { cwd: repoPath });
		if (stdout) throw new Error(`Repository ${ repoPath } is not clean:\n${ stdout }`);

		// Update
		logger.notice("update repository %s", repoPath);
		// await runProgram("git", ["pull"], {
		// 	cwd: repoPath,
		// 	logger: logger.levelRoot.get("git:pull")
		// });
		return;
	}
	logger.notice("clone repository %s from %s", repoPath, repoUrl);
	await runProgram("git", ["clone", repoUrl, repoPath], {
		logger: logger.levelRoot.get("git:clone")
	});
};
