#!/usr/bin/env node

"use strict";

Error.stackTraceLimit = Infinity;

process.on("unhandledRejection", reason => { throw reason; });

require("log4-nodejs")({ defaultNamespace: "dev-package" });

const meta = require("../package");

const argv = require("minimist")(process.argv.slice(2), {
	boolean: ["disable-git-pull", "enable-git-push"]
});

const usage = `dev-package v${ meta.version }

Usage: dev-package [-h | --help] <command> [<args>]

where <command> is one of:
    install

dev-package <command> -h  quick help on <command>

Options:

    --help,            -h  Show this message

`;

const commandUsage = new Map([
	[
		"install",
		`dev-package v${ meta.version }

Usage: dev-package install [-h | --help] [--disable-git-pull] [--enable-git-push] [<package-name>]

When <package-name> is provided, it is ensured it's installed and is up to date,
as located in npm packages folder
(there are no updates made to eventual project at current working directory)

When <package-name> is not provided then all dependencies of a project at
current working directory are ensured to be linked or installed
up to dev-package installation rules

Options:

    --disable-git-pull     Do not pull changes from remote
    --enable-git-push      Push committed changes to remote
    --help,            -h  Show this message

`
	],
	[
		"update-all",
		`dev-package v${ meta.version }

Usage: dev-package update-all [-h | --help] [--disable-git-pull] [--enable-git-push]

Ensures all packages in npm packages folder are properly installed and up to date

Options:

    --disable-git-pull     Do not pull changes from remote
    --enable-git-push      Push committed changes to remote
    --help,            -h  Show this message

`
	]
]);

const [command, packageName] = argv._;

if (argv.h || argv.help) {
	process.stdout.write(commandUsage.get(command) || usage);
	return;
}

if (argv.v || argv.version) {
	process.stdout.write(`${ meta.version }\n`);
	return;
}

if (!command) {
	process.stderr.write(`Provide command name to install\n\n${ usage }`);
	process.exit(1);
}

const supportedCommands = new Set(["install", "update-all"]);

if (!supportedCommands.has(command)) {
	process.stderr.write(`${ command } is not a suppported command\n\n${ usage }`);
	process.exit(1);
}

require("../lib/private/cli")(command, packageName, {
	gitPull: !argv["disable-git-pull"],
	gitPush: argv["enable-git-push"]
});
