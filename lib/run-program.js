"use strict";

const { spawn } = require("child-process-es6-promise")
    , split     = require("split");

module.exports = (command, args, options) => {
	const { logger } = options, promise = spawn(command, args, { cwd: options.cwd });
	const { child } = promise;

	if (logger) {
		child.stdout.pipe(split()).on("data", data => logger.info(String(data)));
		child.stderr.pipe(split()).on("data", data => logger.notice(String(data)));
	}
	return promise;
};
