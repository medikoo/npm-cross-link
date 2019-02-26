"use strict";

const got                 = require("got")
    , tar                 = require("tar")
    , log                 = require("log").get("npm-cross-link")
    , runProgram          = require("../../../../run-program")
    , resolveNpmAuthToken = require("../../resolve-npm-auth-token");

module.exports = {
	resolveCacheName: version => version,
	prepare: async (tmpDir, name, version, versionMetaData) => {
		// Regular npm publication
		const npmAuthToken = (await resolveNpmAuthToken(versionMetaData.dist.tarball)) || "";
		await new Promise((promiseResolve, promiseReject) => {
			const stream = got
				.stream(versionMetaData.dist.tarball, {
					headers: { Authorization: `Bearer ${ npmAuthToken }` }
				})
				.pipe(tar.x({ cwd: tmpDir, strip: 1 }));
			stream.on("error", promiseReject);
			stream.on("end", promiseResolve);
		});
		await runProgram("npm", ["install", "--production"], {
			cwd: tmpDir,
			logger: log.levelRoot.get("npm:install")
		});
	}
};
