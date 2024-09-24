"use strict";

const isObject = require("es5-ext/object/is-object")
    , spawn    = require("child-process-ext/spawn")
    , log      = require("log").get("npm-cross-link");

module.exports = (command, args, options = {}) => {
	if (!isObject(options)) options = {};
	const { logger } = options;
	const promise = spawn(command, args, {
		cwd: options.cwd,
		split: Boolean(logger),
		stdio: ["inherit", "pipe", "pipe"],
	});

	if (logger) {
		if (promise.stdout) promise.stdout.on("data", data => logger.info(String(data)));
		if (promise.stderr) promise.stderr.on("data", data => logger.notice(String(data)));
	}

	return promise.catch(error => {
		if (error.stdBuffer) {
			log.warn(
				"%s failed for %s using options: %O, with -> %#s, output:\n%#s", command,
				args.join(" "), options, error.message, error.stdBuffer
			);
		}
		throw error;
	});
};
