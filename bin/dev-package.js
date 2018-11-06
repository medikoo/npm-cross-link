#!/usr/bin/env node

"use strict";

Error.stackTraceLimit = Infinity;

process.on("unhandledRejection", reason => { throw reason; });

require("log4-nodejs")({ defaultNamespace: "dev-package" });

const meta = require("../package");

const argv = require("minimist")(process.argv.slice(2), {
	boolean: ["disable-git-pull", "enable-git-push"]
});

const usage = `dev-package v${ meta.version } - Install dev package

Usage: dev-package <command>

where <command> is one of:
    install

Options:

    --disable-git-pull     Do not pull changes from remote
    --enable-git-push      Push committed changes to remote
    --version,         -v  Display version
    --help,            -h  Show this message

`;

if (argv.h || argv.help) {
	process.stdout.write(usage);
	return;
}

if (argv.v || argv.version) {
	process.stdout.write(`${ meta.version }\n`);
	return;
}

const [command, packageName] = argv._;

if (!command) {
	process.stderr.write(`Provide command name to install\n\n${ usage }`);
	process.exit(1);
}

const supportedCommands = new Set(["install"]);

if (!supportedCommands.has(command)) {
	process.stderr.write(`${ command } is not a suppported command\n\n${ usage }`);
	process.exit(1);
}

if (!packageName) {
	process.stderr.write(`Provide package name to install\n\n${ usage }`);
	process.exit(1);
}

require("../lib/private/cli")(packageName, {
	gitPull: !argv["disable-git-pull"],
	gitPush: argv["enable-git-push"]
});
