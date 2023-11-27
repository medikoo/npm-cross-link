#!/usr/bin/env node

"use strict";

require("essentials");
require("fs2/descriptors-handler")();

require("log-node")({ defaultNamespace: "npm-cross-link" });

const meta = require("../package");

const argv = require("minimist")(process.argv.slice(2), { boolean: ["pull", "push"] });

const usage = `npm-cross-link-update-all v${ meta.version }

Usage: npm-cross-link-update-all [-h | --help] [--no-pull] [--push]

Ensures all packages in npm packages folder are properly installed and up to date

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

require("../lib/cli")("update-all", null, { pull: argv.pull !== false, push: argv.push !== false });
