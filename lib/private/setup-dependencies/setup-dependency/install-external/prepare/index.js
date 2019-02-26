"use strict";

const optionalChaining    = require("es5-ext/optional-chaining")
    , memoizee            = require("memoizee")
    , { resolve }         = require("path")
    , copyDir             = require("fs2/copy-dir")
    , isDirectory         = require("fs2/is-directory")
    , mkdir               = require("fs2/mkdir")
    , readdir             = require("fs2/readdir")
    , rename              = require("fs2/rename")
    , rm                  = require("fs2/rm")
    , got                 = require("got")
    , tar                 = require("tar")
    , tmpdir              = require("os").tmpdir()
    , log                 = require("log").get("npm-cross-link")
    , runProgram          = require("../../../../../run-program")
    , cachePath           = require("../../../../cache").path
    , resolveNpmAuthToken = require("../../resolve-npm-auth-token");

module.exports = memoizee(
	async (name, version, externalContext) => {
		const versionMetaData = optionalChaining(externalContext, "metadata", "versions", version);
		const versionDirName = versionMetaData ? version : Buffer.from(version).toString("base64");
		const versionCachePath = versionMetaData && resolve(cachePath, name, versionDirName);
		if (versionCachePath && (await isDirectory(versionCachePath))) return versionCachePath;
		log.notice("preparing install of %s", `${ name }@${ version }`);
		const targetDirname = resolve(tmpdir, "npm-cross-link", name, versionDirName);
		await rm(targetDirname, { loose: true, recursive: true, force: true });
		await mkdir(targetDirname, { intermediate: true });

		if (versionMetaData) {
			// Regular npm publication
			const npmAuthToken = (await resolveNpmAuthToken(versionMetaData.dist.tarball)) || "";
			await new Promise((promiseResolve, promiseReject) => {
				const stream = got
					.stream(versionMetaData.dist.tarball, {
						headers: { Authorization: `Bearer ${ npmAuthToken }` }
					})
					.pipe(tar.x({ cwd: targetDirname, strip: 1 }));
				stream.on("error", promiseReject);
				stream.on("end", promiseResolve);
			});
			await runProgram("npm", ["install", "--production"], {
				cwd: targetDirname,
				logger: log.levelRoot.get("npm:install")
			});
		} else {
			// Custom reference (e.g. direct github repo link)
			await runProgram("npm", ["install", `${ name }@${ version }`], {
				cwd: targetDirname,
				logger: log.levelRoot.get("npm:install")
			});
			const sourcePath = resolve(targetDirname, "node_modules", name);
			await Promise.all(
				(await readdir(sourcePath)).map(filename => {
					if (filename === "." || filename === "..") return null;
					return rename(resolve(sourcePath, filename), resolve(targetDirname, filename));
				})
			);
			await rm(sourcePath, { recursive: true, force: true });
		}

		await rm(resolve(targetDirname, "package-lock.json"), {
			loose: true,
			recursive: true,
			force: true
		});
		if (versionCachePath) copyDir(targetDirname, versionCachePath);
		return targetDirname;
	},
	{ promise: true, length: 2 }
);
