#!/usr/bin/env node

"use strict";

Error.stackTraceLimit = Infinity;

process.on("unhandledRejection", reason => { throw reason; });

require("log-node")({ defaultNamespace: "npm-cross-link" });

const meta = require("../package");

const argv = require("minimist")(process.argv.slice(2), {
	boolean: ["global", "help", "pull", "push", "save", "version"],
	alias: { global: "g", help: "h", version: "v" },
	default: { save: true }
});

const [packageName] = argv._;

const usage = `npm-cross-link v${ meta.version }

Usage: npm-cross-link [-h | --help] [--no-pull] [--push] [<package-name>]

When <package-name> is provided, it is linked into project folder
(unless it's a global installation, then package is ensured to be linked
globally, and working directory is not affected)

When <package-name> is not provided then all dependencies of a project at
current working directory are ensured to be linked or installed
up to npm-cross-link installation rules

Options:

    --global, -g  Install package globally
    --pull        Pull changes from remote
    --push        Push committed changes to remote
    --help,   -h  Show this message

`;

if (argv.help) {
	process.stdout.write(usage);
	return;
}

if (argv.version) {
	process.stdout.write(`${ meta.version }\n`);
	return;
}

require("../lib/private/cli")("install", packageName, {
	global: argv.global,
	pull: argv.pull,
	push: argv.push,
	noSave: !argv.save
});
