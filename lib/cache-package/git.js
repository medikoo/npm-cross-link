"use strict";

const memoizee    = require("memoizee")
    , { resolve } = require("path")
    , rm          = require("fs2/rm")
    , log         = require("log").get("npm-cross-link")
    , runProgram  = require("../run-program");

const repoDataRe = /^git\+(?<url>[^#]+)(?:#(?<target>.*))?$/u
    , refRe = /^refs\/(?:heads|tags)\/(?<target>.+)$/u;

const githubRepoRe =
	/^(?<owner>[a-zA-Z0-9_-]+)\/(?<repo>[a-zA-Z0-9_-]+)(?:#(?<target>[a-z0-9]+))?$/u;

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
			result[refMatch.groups.target] = hash;
		}
		log.info("resolved %s refs %o", repoUrl, result);
		return result;
	},
	{ promise: true }
);

module.exports = {
	isApplicable: (name, version) => {
		const repoDataMatch = version.match(repoDataRe);
		if (repoDataMatch) {
			return {
				repoUrl: repoDataMatch.groups.url,
				target: repoDataMatch.groups.target || "HEAD"
			};
		}
		const githubRepoMatch = version.match(githubRepoRe);
		if (githubRepoMatch) {
			return {
				repoUrl: `https://github.com/${ githubRepoMatch.groups.owner }/${
					githubRepoMatch.groups.repo
				}.git`,
				target: githubRepoMatch.groups.target || "HEAD"
			};
		}
		return null;
	},
	resolveCacheName: async (version, repoData) => {
		const { repoUrl, target } = repoData;
		const refs = await resolveRemoteRefs(repoUrl);
		return `git.${ refs[target] || target }`;
	},
	prepare: async (tmpDir, name, version, repoData) => {
		const { repoUrl, target } = repoData;
		const dotGitPath = resolve(tmpDir, ".git");
		await runProgram("git", ["clone", "--mirror", repoUrl, dotGitPath], {
			logger: log.levelRoot.get("git:clone")
		});
		await runProgram("git", ["init"], { cwd: tmpDir, logger: log.levelRoot.get("git:init") });
		await runProgram("git", ["checkout", target], {
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
