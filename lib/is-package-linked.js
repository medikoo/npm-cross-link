"use strict";

const logger         = require("log4").get("setup-own-package")
    , { resolve }    = require("path")
    , memoize        = require("memoizee")
    , getLogGatherer = require("./get-log-gatherer")
    , isSymbolicLink = require("./is-symbolic-link")
    , runProgram     = require("./run-program");

const getNpmPathPrefix = memoize(async () => {
	const { lines, logger: gatherer } = getLogGatherer();
	await runProgram("npm", ["config", "get", "prefix"], { cwd: process.cwd(), logger: gatherer });
	const [npmPathPrefix] = lines;
	if (!npmPathPrefix) throw new Error("Could not resolve npm path prefix");
	logger.notice("resolved npm path prefix %s", npmPathPrefix);
	return npmPathPrefix;
});

module.exports = async packageName => {
	const npmPathPrefix = await getNpmPathPrefix();
	return isSymbolicLink(resolve(npmPathPrefix, "lib/node_modules", packageName));
};
