"use strict";

const memoizee    = require("memoizee")
    , { resolve } = require("path")
    , mkdir       = require("fs2/mkdir")
    , readdir     = require("fs2/readdir")
    , rename      = require("fs2/rename")
    , rm          = require("fs2/rm")
    , got         = require("got")
    , tar         = require("tar")
    , tmpdir      = require("os").tmpdir()
    , log         = require("log").get("npm-cross-link")
    , runProgram  = require("../../../../run-program");

module.exports = memoizee(
	async (name, version, metadata) => {
		log.notice("preparing install of %s", `${ name }@${ version }`);
		const targetDirname = resolve(
			tmpdir, "npm-cross-link", name, Buffer.from(version).toString("base64")
		);
		await rm(targetDirname, { loose: true, recursive: true, force: true });
		await mkdir(targetDirname, { intermediate: true });

		if (metadata.versions[version]) {
			// Regular npm publication
			await new Promise((promiseResolve, promiseReject) => {
				const stream = got
					.stream(metadata.versions[version].dist.tarball)
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
		return targetDirname;
	},
	{ promise: true, length: 2 }
);
