"use strict";

const memoizee    = require("memoizee")
    , { resolve } = require("path")
    , mkdir       = require("fs2/mkdir")
    , rm          = require("fs2/rm")
    , got         = require("got")
    , tar         = require("tar")
    , tmpdir      = require("os").tmpdir()
    , log         = require("log").get("npm-cross-link")
    , runProgram  = require("../../../../run-program");

module.exports = memoizee(
	async (name, version, metadata) => {
		const targetDirname = resolve(tmpdir, "npm-cross-link", name, version);
		log.notice("preparing install of %s", `${ name }@${ version }`);
		await rm(targetDirname, { loose: true, recursive: true, force: true });
		await mkdir(targetDirname, { intermediate: true });
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
		await rm(resolve(targetDirname, "package-lock.json"), {
			loose: true,
			recursive: true,
			force: true
		});
		return targetDirname;
	},
	{ promise: true, length: 2 }
);
