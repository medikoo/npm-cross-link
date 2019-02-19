"use strict";

const memoizee   = require("memoizee")
    , got        = require("got")
    , log        = require("log").get("npm-cross-link")
    , runProgram = require("../../../run-program");

module.exports = memoizee(
	async dependencyName => {
		log.info("resolve metadata for %s", dependencyName);
		try {
			const { stdoutBuffer } = await runProgram(
				"npm",
				["view", dependencyName, "dist.tarball"],
				{ cwd: process.cwd() }
			);
			const registryPackageLatestTarballUrl = String(stdoutBuffer).trim();
			const registryPackageUrl = registryPackageLatestTarballUrl.slice(
				0, registryPackageLatestTarballUrl.lastIndexOf("/-/")
			);
			return JSON.parse(
				(await got(registryPackageUrl, {
					headers: { accept: "application/vnd.npm.install-v1+json" }
				})).body
			);
		} catch (error) {
			log.error(
				"Could not retrieve npm info for %s due to %s", dependencyName, error.message
			);
			log.debug("Received error %o", error);
			return null;
		}
	},
	{ promise: true }
);
