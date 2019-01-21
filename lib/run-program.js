"use strict";

const isObject = require("es5-ext/object/is-object")
    , spawn    = require("child-process-ext/spawn")
    , log      = require("log").get("npm-cross-link");

module.exports = (command, args, options = {}) => {
	if (!isObject(options)) options = {};
	const { logger } = options;
	const promise = spawn(command, args, { cwd: options.cwd, split: Boolean(logger) });

	if (logger) {
		promise.stdout.on("data", data => logger.info(String(data)));
		promise.stderr.on("data", data => logger.notice(String(data)));
	}

	return promise.catch(error => {
		log.warn("%s failed for %s, %O with %#s", command, args, options, error.message);
		throw error;
	});
};
