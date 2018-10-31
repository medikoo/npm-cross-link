"use strict";

const memoizee = require("memoizee")
    , got      = require("got")
    , log      = require("log4").get("dev-package");

module.exports = memoizee(
	async dependencyName => {
		log.info("resolve metadata for %s", dependencyName);
		try {
			return JSON.parse(
				(await got(`https://registry.npmjs.org/${ dependencyName }`, {
					headers: { accept: "application/vnd.npm.install-v1+json" }
				})).body
			);
		} catch (error) {
			log.error("Could not retrieve npm info for %s", dependencyName);
			throw error;
		}
	},
	{ promise: true }
);
