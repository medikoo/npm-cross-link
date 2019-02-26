"use strict";

const { resolve } = require("path")
    , readdir     = require("fs2/readdir")
    , rename      = require("fs2/rename")
    , rm          = require("fs2/rm")
    , log         = require("log").get("npm-cross-link")
    , runProgram  = require("../../../../../run-program");

module.exports = {
	resolveCacheName: () => null,
	prepare: async (tmpDir, name, version) => {
		await runProgram("npm", ["install", `${ name }@${ version }`], {
			cwd: tmpDir,
			logger: log.levelRoot.get("npm:install")
		});
		const sourcePath = resolve(tmpDir, "node_modules", name);
		await Promise.all(
			(await readdir(sourcePath)).map(filename => {
				if (filename === "." || filename === "..") return null;
				return rename(resolve(sourcePath, filename), resolve(tmpDir, filename));
			})
		);
		await rm(sourcePath, { recursive: true, force: true });
	}
};
