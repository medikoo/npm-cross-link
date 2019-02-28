#!/usr/bin/env node

"use strict";

Error.stackTraceLimit = Infinity;

process.on("unhandledRejection", reason => { throw reason; });

require("log-node")({ defaultNamespace: "npm-cross-link" });

const meta = require("../package");

const argv = require("minimist")(process.argv.slice(2), {
	boolean: ["global", "help", "pull", "push", "save", "save-dev", "save-optional", "version"],
	alias: { global: "g", help: "h", version: "v" },
	default: { save: true }
});

const [packageName] = argv._;

const usage = `npm-cross-link v${ meta.version }

Usage:

npm-cross-link                                         (in package dir)
npm-cross-link    [<@scope>/]<name>[@<version range>]  (in package dir)
npm-cross-link -g [<@scope>/]<name>

common-options: [-h | --help] [--pull] [--push]

    --pull        Pull changes from remote (for maintained packages)
		--push        Push committed changes to remote (for maintained packages)
		--no-save     Do not update package.json with updated dependencies versions
    --help,   -h  Show this message
    --global, -g  Install package globall

o npm-cross-link (in package dir)

		Ensure all project dependencies are up to date, and are setup completely in their folder.
		Global installations (or local project folders in case of maintained package) are linked
		if dependency references latest version.
		Update package.json dependencies section with updated version ranges

o npm-cross-link [<@scope>/]<name>[@<version range>]

		Install dependency (link if references latest version).
		Update version range in package.json.

		Additonal options:

				--save-dev       Save new dependency in devDependencies
				--save-optional  Save new dependency in optionalDependencies

o npm-cross-link -g [<@scope>/]<name>	

		Install latest version of a package globally. If it's a maintained package, it's setup
		(or updated if needed) in npm packages folder.

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
	noSave: !argv.save,
	saveMode: (() => {
		if (argv["save-dev"]) return "dev";
		if (argv["save-optional"]) return "optional";
		return "prod";
	})()
});
