"use strict";

const log        = require("log4").get("dev-package")
    , memoize    = require("memoizee")
    , runProgram = require("./run-program");

module.exports = memoize(
	async () => {
		const { stdout } = await runProgram("npm", ["config", "get", "prefix"], {
			cwd: process.cwd()
		});
		const [npmPathPrefix] = String(stdout).split("\n", 1);
		if (!npmPathPrefix) throw new Error("Could not resolve npm path prefix");
		log.notice("resolved npm path prefix %s", npmPathPrefix);
		return npmPathPrefix;
	},
	{ promise: true }
);
