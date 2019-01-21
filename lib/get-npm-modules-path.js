"use strict";

const { resolve } = require("path")
    , log         = require("log").get("npm-cross-link")
    , memoize     = require("memoizee")
    , runProgram  = require("./run-program");

module.exports = memoize(
	async () => {
		const { stdoutBuffer } = await runProgram("npm", ["config", "get", "prefix"], {
			cwd: process.cwd()
		});
		const [npmPathPrefix] = String(stdoutBuffer).split("\n", 1);
		if (!npmPathPrefix) throw new Error("Could not resolve npm path prefix");
		log.notice("npm path prefix: %s", npmPathPrefix);
		if (process.platform === "win32") return resolve(npmPathPrefix, "node_modules");
		return resolve(npmPathPrefix, "lib", "node_modules");
	},
	{ promise: true }
);
