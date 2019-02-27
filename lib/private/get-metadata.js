"use strict";

const memoizee = require("memoizee")
    , got      = require("got")
    , log      = require("log").get("npm-cross-link")
    , npmconf  = require("npm/lib/config/core")
    , cache    = require("./cache");

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

const resolveCached = async name => {
	const cached = await cache.get(`${ name }/registry.json`);
	if (!cached) return {};
	try { return JSON.parse(cached); }
	catch (error) { return {}; }
};

module.exports = memoizee(
	async dependencyName => {
		log.info("resolve metadata for %s", dependencyName);
		const registryData = await resolveRegistryData(dependencyName);
		const cached = await resolveCached(dependencyName);
		const response = await (async () => {
			try {
				return await got(`${ registryData.url }${ dependencyName }`, {
					headers: Object.assign(
						{ accept: "application/vnd.npm.install-v1+json" },
						registryData.authToken && {
							authorization: `Bearer ${ registryData.authToken }`
						},
						// We do not rely on got's cache
						// as it's not effective with 'authorization' header
						cached.etag && { "if-none-match": cached.etag }
					)
				});
			} catch (error) {
				log.error(
					"Could not retrieve npm info for %s due to %s", dependencyName, error.message
				);
				log.debug("Received error %o", error);
				return null;
			}
		})();
		if (!response) return response;
		if (response.statusCode === 304) return cached.data;
		const result = JSON.parse(response.body);
		cache.set(
			`${ dependencyName }/registry.json`,
			JSON.stringify({ etag: response.headers.etag, data: result })
		);
		return result;
	},
	{ promise: true }
);
