"use strict";

const memoizee            = require("memoizee")
    , { resolve }         = require("path")
    , isDirectory         = require("fs2/is-directory")
    , mkdir               = require("fs2/mkdir")
    , rename              = require("fs2/rename")
    , chmod               = require("fs2/chmod")
    , rm                  = require("fs2/rm")
    , tmpdir              = require("os").tmpdir()
    , log                 = require("log").get("npm-cross-link")
    , cachePath           = require("../cache").path
    , getPackageJson      = require("../get-package-json")
    , updatePackageJson   = require("../update-package-json")
    , resolveBinariesDict = require("../resolve-package-binaries-dict");

const methods = [require("./sem-ver"), require("./git"), require("./other")];

module.exports = memoizee(
	async (name, version, externalContext) => {
		let methodData;
		const method = methods.find(
			potentialMethod =>
				(methodData = potentialMethod.isApplicable(name, version, externalContext))
		);

		const versionCacheName = await method.resolveCacheName(version, methodData);
		log.info("%s cache name for %s is %s", name, version, versionCacheName);
		const versionCachePath = versionCacheName && resolve(cachePath, name, versionCacheName);
		if (versionCachePath && (await isDirectory(versionCachePath))) return versionCachePath;
		log.notice("preparing %s", `${ name }@${ version }`);
		const packageTmpDir = resolve(
			tmpdir, "npm-cross-link", name, Buffer.from(version).toString("base64")
		);
		await rm(packageTmpDir, { loose: true, recursive: true, force: true });
		await mkdir(packageTmpDir, { intermediate: true });
		await method.prepare(packageTmpDir, name, version, methodData);
		await rm(resolve(packageTmpDir, "package-lock.json"), {
			loose: true,
			recursive: true,
			force: true
		});

		if (process.platform !== "win32") {
			const binariesDict = resolveBinariesDict(packageTmpDir);
			if (binariesDict) {
				await Promise.all(
					Object.values(binariesDict).map(path =>
						chmod(resolve(packageTmpDir, path), 0o111, { append: true })
					)
				);
			}
		}
		if (!versionCachePath) return packageTmpDir;

		await rename(packageTmpDir, versionCachePath, { intermediate: true });
		const packageJson = getPackageJson(versionCachePath) || {};
		packageJson._npmCrossLinkCacheName = versionCacheName;
		await updatePackageJson(versionCachePath, packageJson);
		return versionCachePath;
	},
	{ promise: true, length: 2 }
);
