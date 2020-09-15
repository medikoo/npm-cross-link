"use strict";

const memoizee    = require("memoizee")
    , { resolve } = require("path")
    , log         = require("log").get("npm-cross-link")
    , isDirectory = require("fs2/is-directory")
    , rm          = require("fs2/rm")
    , runProgram  = require("../run-program");

module.exports = memoizee(
	async (packageContext, { multiPackageReposMeta }, inputOptions, { topPackageName }) => {
		const meta = packageContext.meta.multiPackageRepoName
			? multiPackageReposMeta[packageContext.meta.multiPackageRepoName]
			: packageContext.meta;
		const { repoUrl } = meta;
		const branch = meta.branch || "master";
		const path = meta.path || packageContext.path;

		const { name } = packageContext;
		const report = new Set();
		if (await isDirectory(resolve(path, ".git"))) {
			let tryPull = inputOptions.pull;
			const tryPush = inputOptions.push;

			if (name !== topPackageName) {
				// Confirm we're on expected branch
				const currentBranch = String(
					(await runProgram("git", ["branch", "--show-current"], { cwd: path }))
						.stdoutBuffer
				).trim();

				if (currentBranch !== branch) {
					log.warning("%s is not at expected %s branch", name, branch);
					return report;
				}
			}

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
				await runProgram("git", ["push"], {
					cwd: path,
					logger: log.levelRoot.get("git:push")
				});
				report.add("push");
			}
			return report;
		}
		await rm(path, { loose: true, recursive: true, force: true });
		log.info("clone repository %s from %s", path, repoUrl);
		await runProgram("git", ["clone", repoUrl, path], {
			logger: log.levelRoot.get("git:clone")
		});
		const currentBranch = String(
			(await runProgram("git", ["branch", "--show-current"], { cwd: path })).stdoutBuffer
		).trim();
		if (currentBranch !== branch) {
			await runProgram("git", ["checkout", branch], {
				logger: log.levelRoot.get("git:branch")
			});
		}
		report.add("clone");
		return report;
	},
	{
		promise: true,
		length: 1,
		normalizer: ([packageContext, { multiPackageReposMeta }]) =>
			packageContext.meta.multiPackageRepoName
				? multiPackageReposMeta[packageContext.meta.multiPackageRepoName].path
				: packageContext.path
	}
);
