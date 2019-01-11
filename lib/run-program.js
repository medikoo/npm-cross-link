"use strict";

const isObject  = require("es5-ext/object/is-object")
    , { spawn } = require("child-process-es6-promise")
    , split     = require("split")
    , log       = require("log").get("npm-cross-link");

const winCmdCommands = new Set();

module.exports = (command, args, options = {}) => {
	if (!isObject(options)) options = {};
	const { logger } = options;
	let promise = spawn(command + (winCmdCommands.has(command) ? ".cmd" : ""), args, {
		cwd: options.cwd
	});
	const { child } = promise;

	if (logger) {
		child.stdout
			.pipe(split(/\r?\n/u, null, { trailing: false }))
			.on("data", data => logger.info(String(data)));
		child.stderr
			.pipe(split(/\r?\n/u, null, { trailing: false }))
			.on("data", data => logger.notice(String(data)));
	}

	if (process.platform === "win32" && !winCmdCommands.has(command)) {
		promise = promise.catch(error => {
			if (error.code !== "ENOENT") throw error;
			winCmdCommands.add(command);
			return module.exports(command, args, options);
		});
	}
	return promise.catch(error => {
		log.warn("%s failed for %s, %O with %#s", command, args, options, error.message);
		throw error;
	});
};
