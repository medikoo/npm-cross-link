"use strict";

const { spawn } = require("child_process")
    , Deferred  = require("deferred");

const newLineRe = /[\n\r]/u;

const processOutput = (stream, logger) => {
	let buffer = "";
	const flush = isFinal => {
		if (!buffer) return;
		if (!buffer.match(newLineRe)) {
			if (!isFinal) return;
			logger(buffer);
			return;
		}
		const lines = buffer.split(newLineRe);
		buffer = isFinal ? "" : lines.pop();
		for (const line of lines) logger(line);
	};

	stream.on("data", data => {
		buffer += data;
		flush();
	});
	stream.on("error", flush);
	stream.on("end", flush);
};

module.exports = (command, args, options) => {
	const { logger } = options
	    , deferred = new Deferred()
	    , child = spawn(command, args, { cwd: options.cwd });

	child.on("error", deferred.reject);
	processOutput(child.stdout, logger.info);
	processOutput(child.stderr, logger.notice);
	child.on("close", code => {
		if (code) deferred.reject(new Error(`Program exited with: ${ code }`));
		else deferred.resolve();
	});
	return deferred.promise;
};
