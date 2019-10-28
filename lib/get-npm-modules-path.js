"use strict";

const log        = require("log").get("npm-cross-link")
    , memoize    = require("memoizee")
    , runProgram = require("./run-program");

module.exports = memoize(
	async () => {
		const { stdoutBuffer } = await runProgram("npm", ["root", "-g"], { cwd: process.cwd() });
		const npmPathPrefix = String(stdoutBuffer).trim();
		if (!npmPathPrefix) throw new Error("Could not resolve npm path prefix");
		log.notice("npm packages global path: %s", npmPathPrefix);
		return npmPathPrefix;
	},
	{ promise: true }
);
