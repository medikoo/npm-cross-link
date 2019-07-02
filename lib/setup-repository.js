"use strict";

const isObject    = require("es5-ext/object/is-object")
    , { resolve } = require("path")
    , log         = require("log").get("npm-cross-link")
    , isDirectory = require("fs2/is-directory")
    , rm          = require("fs2/rm")
    , runProgram  = require("./run-program");

module.exports = async (path, repoUrl, options = {}) => {
	if (!isObject(options)) options = {};
	const report = new Set();
	if (await isDirectory(resolve(path, ".git"))) {
		let tryPull = options.pull;
		const tryPush = options.push;

		if (!tryPull && !tryPush) return report;

		if (tryPull) {
			// Confirm directory is clean
			const { stdoutBuffer } = await runProgram("git", ["status", "--porcelain"], {
				cwd: path
			});
			const localStatus = String(stdoutBuffer);
			if (localStatus) {
				tryPull = false;
				log.error(
					"Cannot pull repository at %s, as it's not clean:\n%#s", path,
					localStatus.split("\n").filter(Boolean).map(line => ` ${ line }`).join("\n")
				);
			} else {
				// Fetch changes from remote
				log.info("update repository %s", path);
				await runProgram("git", ["remote", "update", "origin"], {
					cwd: path,
					logger: log.levelRoot.get("git:remote")
				});
			}
		}

		const { stdoutBuffer } = await runProgram("git", ["status"], { cwd: path });
		const localStatus = String(stdoutBuffer);

		if (tryPull && localStatus.includes("Your branch is behind")) {
			await runProgram("git", ["merge", "FETCH_HEAD"], {
				cwd: path,
				logger: log.levelRoot.get("git:merge")
			});
			report.add("pull");
		}

		if (tryPush && localStatus.includes("Your branch is ahead")) {
			await runProgram("git", ["push"], { cwd: path, logger: log.levelRoot.get("git:push") });
			report.add("push");
		}
		return report;
	}
	await rm(path, { loose: true, recursive: true, force: true });
	log.info("clone repository %s from %s", path, repoUrl);
	await runProgram("git", ["clone", repoUrl, path], { logger: log.levelRoot.get("git:clone") });
	report.add("clone");
	return report;
};
