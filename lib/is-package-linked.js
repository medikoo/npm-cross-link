"use strict";

const logger         = require("log4").get("dev-package-install")
    , { resolve }    = require("path")
    , memoize        = require("memoizee")
    , isSymbolicLink = require("./is-symbolic-link")
    , runProgram     = require("./run-program");

const getNpmPathPrefix = memoize(
	async () => {
		const { stdout } = await runProgram("npm", ["config", "get", "prefix"], {
			cwd: process.cwd()
		});
		const [npmPathPrefix] = String(stdout).split("\n", 1);
		if (!npmPathPrefix) throw new Error("Could not resolve npm path prefix");
		logger.notice("resolved npm path prefix %s", npmPathPrefix);
		return npmPathPrefix;
	},
	{ promise: true }
);

module.exports = async packageName => {
	const npmPathPrefix = await getNpmPathPrefix();
	return isSymbolicLink(resolve(npmPathPrefix, "lib/node_modules", packageName));
};
