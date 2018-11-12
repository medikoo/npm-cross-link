#!/usr/bin/env node

"use strict";

Error.stackTraceLimit = Infinity;

process.on("unhandledRejection", reason => { throw reason; });

require("log4-nodejs")({ defaultNamespace: "npm-cross-link" });

const meta = require("../package");

const argv = require("minimist")(process.argv.slice(2), { boolean: ["pull", "push"] });

const [command, packageName] = argv._;

const usage = require("../lib/private/cli/usage");
if (argv.h || argv.help) {
	process.stdout.write(usage[command] || usage.main);
	return;
}

if (argv.v || argv.version) {
	process.stdout.write(`${ meta.version }\n`);
	return;
}

if (!command) {
	process.stderr.write(`Provide command name to install\n\n${ usage.main }`);
	process.exit(1);
}

const supportedCommands = new Set(["install", "update-all"]);

if (!supportedCommands.has(command)) {
	process.stderr.write(`${ command } is not a suppported command\n\n${ usage.main }`);
	process.exit(1);
}

require("../lib/private/cli")(command, packageName, {
	pull: argv.pull !== false,
	push: argv.push !== false
});
