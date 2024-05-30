"use strict";

const memoizee    = require("memoizee")
    , { resolve } = require("path")
    , { homedir } = require("os")
    , log         = require("log").get("npm-cross-link")
    , readFile    = require("fs2/read-file");

const scopedPackageUrlRule = /(?<packageName>\/@[^\\]+\/[^\\]+)$/u;
const tokenRe = /^\/\/(?<registryName>.+)\/:_authToken=(?<authToken>.+)$/u;

const resolveRepoTokens = memoizee(
	async () => {
		const npmRc = await readFile(resolve(homedir(), ".npmrc"), {
			encoding: "utf8",
			loose: true,
		});
		const repoToTokenMap = new Map();
		if (!npmRc) {
			log.info(".npmrc not found");
			return repoToTokenMap;
		}
		for (const npmRcLine of npmRc.split(/[\n\r]/u)) {
			const match = npmRcLine.trim().match(tokenRe);
			if (!match) continue;
			repoToTokenMap.set(match.groups.registryName, match.groups.authToken);
		}
		log.info("resolved npm auth tokens for %o", repoToTokenMap.keys());
		return repoToTokenMap;
	},
	{ promise: true }
);

const resolveRegistryUrl = registryPackageLatestTarballUrl => {
	const registryPackageUrl = registryPackageLatestTarballUrl.slice(
		0, registryPackageLatestTarballUrl.lastIndexOf("/-/")
	);
	const scopedPackageUrlMatch = registryPackageUrl.match(scopedPackageUrlRule);
	if (!scopedPackageUrlMatch) {
		return registryPackageUrl.slice(0, registryPackageUrl.lastIndexOf("/"));
	}
	return registryPackageUrl.slice(0, -scopedPackageUrlMatch.groups.packageName.length);
};

module.exports = memoizee(
	async registryPackageTarballUrl => {
		const registryUrl = resolveRegistryUrl(registryPackageTarballUrl);
		return (await resolveRepoTokens()).get(registryUrl.slice(registryUrl.indexOf("//") + 2));
	},
	{ promise: true }
);
