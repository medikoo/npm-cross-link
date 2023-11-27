"use strict";

const optionalChaining    = require("es5-ext/optional-chaining")
    , { resolve }         = require("path")
    , readFile            = require("fs2/read-file")
    , writeFile           = require("fs2/write-file")
    , tar                 = require("tar")
    , log                 = require("log").get("npm-cross-link")
    , runProgram          = require("../../../run-program")
    , resolveNpmAuthToken = require("../../resolve-npm-auth-token")
    , nodeFetch           = require("node-fetch");

module.exports = {
	isApplicable: (name, version, externalContext) =>
		optionalChaining(externalContext, "metadata", "versions", version),
	resolveCacheName: version => version,
	prepare: async (tmpDir, name, version, versionMetaData) => {
		// Regular npm publication
		const npmAuthToken = (await resolveNpmAuthToken(versionMetaData.dist.tarball)) || "";
		const response = await nodeFetch(versionMetaData.dist.tarball, {
			headers: { Authorization: `Bearer ${ npmAuthToken }` }
		});
		const stream = response.body.pipe(tar.x({ cwd: tmpDir, strip: 1 }));
		await new Promise((promiseResolve, promiseReject) => {
			stream.on("error", promiseReject);
			stream.on("end", promiseResolve);
		});
		// Hide devDependencies, as non-supported configurations crash `npm install --production`
		// (while it's not the case if package is installed via `npm install package-name`)
		// Example case is `jsdom` package:
		// https://github.com/jsdom/jsdom/blob/960cb523fe8609eb37743a3c2a617f3cf4621596/package.json#L67
		const pkgJsonPath = resolve(tmpDir, "package.json");
		const originalPkgJson = await readFile(pkgJsonPath);
		const pkgJson = JSON.parse(originalPkgJson);
		delete pkgJson.devDependencies;
		if (pkgJson.scripts) delete pkgJson.scripts.prepare;
		await writeFile(pkgJsonPath, JSON.stringify(pkgJson));
		await runProgram("npm", ["install", "--production"], {
			cwd: tmpDir,
			logger: log.levelRoot.get("npm:install")
		});
		await writeFile(pkgJsonPath, originalPkgJson);
	}
};
