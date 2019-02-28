"use strict";

const memoizee    = require("memoizee")
    , { resolve } = require("path")
    , rm          = require("fs2/rm")
    , log         = require("log").get("npm-cross-link")
    , runProgram  = require("../../../../run-program");

const repoDataRe = /^git\+([^#]+)(?:#(.*))?$/u, refRe = /^refs\/(?:heads|tags)\/(.+)$/u;

const resolveRemoteRefs = memoizee(
	async repoUrl => {
		const { stdoutBuffer } = await runProgram("git", ["ls-remote", repoUrl], {
			logger: log.levelRoot.get("git:ls-remote")
		});
		const result = {};
		for (let line of String(stdoutBuffer).trim().split(/[\n\r]+/u)) {
			line = line.trim();
			if (!line) continue;
			const [hash, ref] = line.split("\t");
			if (!ref) continue;
			if (ref === "HEAD") {
				result.HEAD = hash;
				continue;
			}
			const refMatch = ref.match(refRe);
			if (!refMatch) continue;
			result[refMatch[1]] = hash;
		}
		log.info("resolved %s refs %o", repoUrl, result);
		return result;
	},
	{ promise: true }
);

module.exports = {
	isApplicable: (name, version) => version.match(repoDataRe),
	resolveCacheName: async version => {
		const [, repoUrl, target] = version.match(repoDataRe);
		const refs = await resolveRemoteRefs(repoUrl);
		if (!target) return `git.${ refs.HEAD }`;
		return `git.${ refs[target] || target }`;
	},
	prepare: async (tmpDir, name, version, repoData) => {
		const [, repoUrl, target] = repoData;
		const dotGitPath = resolve(tmpDir, ".git");
		await runProgram("git", ["clone", "--mirror", repoUrl, dotGitPath], {
			logger: log.levelRoot.get("git:clone")
		});
		await runProgram("git", ["init"], { cwd: tmpDir, logger: log.levelRoot.get("git:init") });
		await runProgram("git", ["checkout", target || "HEAD"], {
			cwd: tmpDir,
			logger: log.levelRoot.get("git:checkout")
		});
		await rm(dotGitPath, { recursive: true, force: true });
		await runProgram("npm", ["install", "--production"], {
			cwd: tmpDir,
			logger: log.levelRoot.get("npm:install")
		});
	}
};
