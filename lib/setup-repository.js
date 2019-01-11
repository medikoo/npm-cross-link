"use strict";

const isObject          = require("es5-ext/object/is-object")
    , { resolve }       = require("path")
    , log               = require("log").get("npm-cross-link")
    , isDirectory       = require("fs2/is-directory")
    , rm                = require("fs2/rm")
    , NpmCrossLinkError = require("./npm-cross-link-error")
    , runProgram        = require("./run-program");

module.exports = async (path, repoUrl, options = {}) => {
	if (!isObject(options)) options = {};
	const report = new Set();
	if (await isDirectory(resolve(path, ".git"))) {
		const tryPull = options.pull, tryPush = options.push;

		if (!tryPull && !tryPush) return report;

		if (tryPull) {
			// Confirm directory is clean
			const { stdout: localStatus } = await runProgram("git", ["status", "--porcelain"], {
				cwd: path
			});
			if (localStatus) {
				throw new NpmCrossLinkError(
					`Cannot proceed with update, repository at ${ path } is not clean:\n${
						localStatus.split("\n").map(line => `  ${ line }`).join("\n")
					}`
				);
			}

			// Update
			log.info("update repository %s", path);
			await runProgram("git", ["remote", "update"], {
				cwd: path,
				logger: log.levelRoot.get("git:remote")
			});
		}

		const { stdout: localStatus } = await runProgram("git", ["status"], { cwd: path });

		if (
			tryPull &&
			(localStatus.includes("Your branch is behind") || localStatus.includes("have diverged"))
		) {
			await runProgram("git", ["merge", "FETCH_HEAD"], {
				cwd: path,
				logger: log.levelRoot.get("git:merge")
			});
			report.add("pull");
		}

		if (
			tryPush &&
			(localStatus.includes("Your branch is ahead") || localStatus.includes("have diverged"))
		) {
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
