"use strict";

const memoizee = require("memoizee")
    , got      = require("got")
    , log      = require("log").get("npm-cross-link")
    , npmconf  = require("npm/lib/config/core");

const scopedNameRe = /^@([^/]+)\/./u;

const resolveNpmConf = memoizee(
	() =>
		new Promise((resolve, reject) => {
			npmconf.load({}, null, (error, config) => {
				if (error) {
					reject(error);
					return;
				}
				const resolvedConf = Object.assign({}, ...config.list);
				log.info("npm conf %o", resolvedConf);
				resolve(resolvedConf);
			});
		}),
	{ promise: true }
);

const resolveRegistryData = async name => {
	const npmConf = await resolveNpmConf();
	const scopedMatch = name.match(scopedNameRe);
	const url =
		(scopedMatch && npmConf[`@${ scopedMatch[1] }:registry`]) || "https://registry.npmjs.org/";
	const trimmedUrl = url.slice(url.indexOf("//"));
	return { url, authToken: npmConf[`${ trimmedUrl }:_authToken`] || "" };
};

module.exports = memoizee(
	async dependencyName => {
		log.info("resolve metadata for %s", dependencyName);
		const registryData = await resolveRegistryData(dependencyName);
		try {
			return JSON.parse(
				(await got(`${ registryData.url }${ dependencyName }`, {
					headers: {
						accept: "application/vnd.npm.install-v1+json",
						authorization: `Bearer ${ registryData.authToken }`
					}
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
