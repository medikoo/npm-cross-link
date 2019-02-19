"use strict";

const memoizee = require("memoizee")
    , got      = require("got")
    , log      = require("log").get("npm-cross-link");

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
			log.error(
				"Could not retrieve npm info for %s due to %s", dependencyName, error.message
			);
			log.debug("Received error %o", error);
			return null;
		}
	},
	{ promise: true }
);
