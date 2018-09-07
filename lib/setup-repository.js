"use strict";

const logger         = require("log4").get("setup-own-package")
    , isDirectory    = require("./is-directory")
    , runProgram     = require("./run-program")
    , getLogGatherer = require("./get-log-gatherer");

module.exports = async (repoPath, repoUrl) => {
	if (await isDirectory(repoPath)) {
		// Confirm directory is clean
		const { lines, logger: gatherer } = getLogGatherer();
		await runProgram("git", ["status", "--porcelain"], { cwd: repoPath, logger: gatherer });
		if (lines.length) {
			throw new Error(`Repository ${ repoPath } is not clean:\n${ lines.join("\n") }`);
		}

		// Update
		logger.notice("update repository %s", repoPath);
		await runProgram("git", ["pull"], {
			cwd: repoPath,
			logger: logger.levelRoot.get("git:pull")
		});
		return;
	}
	logger.notice("clone repository %s from %s", repoPath, repoUrl);
	await runProgram("git", ["clone", repoUrl, repoPath], {
		logger: logger.levelRoot.get("git:clone")
	});
};
