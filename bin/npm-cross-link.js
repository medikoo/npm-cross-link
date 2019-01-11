#!/usr/bin/env node

"use strict";

Error.stackTraceLimit = Infinity;

process.on("unhandledRejection", reason => { throw reason; });

require("log-node")({ defaultNamespace: "npm-cross-link" });

const meta = require("../package");

const argv = require("minimist")(process.argv.slice(2), { boolean: ["pull", "push"] });

const [packageName] = argv._;

const usage = `npm-cross-link v${ meta.version }

Usage: npm-cross-link [-h | --help] [--no-pull] [--push] [<package-name>]

When <package-name> is provided, it is ensured it's installed and is up to date,
as located in npm packages folder
(there are no updates made to eventual project at current working directory)

When <package-name> is not provided then all dependencies of a project at
current working directory are ensured to be linked or installed
up to npm-cross-link installation rules

Options:

    --pull      Pull changes from remote
    --push      Push committed changes to remote
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

require("../lib/private/cli")("install", packageName, {
	pull: argv.pull !== false,
	push: argv.push !== false
});
