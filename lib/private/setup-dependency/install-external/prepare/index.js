"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , memoizee         = require("memoizee")
    , { resolve }      = require("path")
    , isDirectory      = require("fs2/is-directory")
    , mkdir            = require("fs2/mkdir")
    , rename           = require("fs2/rename")
    , rm               = require("fs2/rm")
    , tmpdir           = require("os").tmpdir()
    , log              = require("log").get("npm-cross-link")
    , cachePath        = require("../../../cache").path;

const methods = { git: require("./git"), semVer: require("./sem-ver"), other: require("./other") };

module.exports = memoizee(
	async (name, version, externalContext) => {
		const versionMetaData = optionalChaining(externalContext, "metadata", "versions", version);
		const method =
			methods[
				(() => {
					if (versionMetaData) return "semVer";
					if (version.startsWith("git+")) return "git";
					return "other";
				})()
			];
		const versionCacheName = await method.resolveCacheName(version);
		log.info("%s cache name for %s is %s", name, version, versionCacheName);
		const versionCachePath = versionCacheName && resolve(cachePath, name, versionCacheName);
		if (versionCachePath && (await isDirectory(versionCachePath))) return versionCachePath;
		log.notice("preparing install of %s", `${ name }@${ version }`);
		const packageTmpDir = resolve(
			tmpdir, "npm-cross-link", name, Buffer.from(version).toString("base64")
		);
		await rm(packageTmpDir, { loose: true, recursive: true, force: true });
		await mkdir(packageTmpDir, { intermediate: true });
		await method.prepare(packageTmpDir, name, version, versionMetaData);
		await rm(resolve(packageTmpDir, "package-lock.json"), {
			loose: true,
			recursive: true,
			force: true
		});
		if (versionCachePath) {
			await rename(packageTmpDir, versionCachePath);
			return versionCachePath;
		}
		return packageTmpDir;
	},
	{ promise: true, length: 2 }
);
