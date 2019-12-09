#!/usr/bin/env node

"use strict";

require("essentials");
require("fs2/descriptors-handler")();

require("log-node")({ defaultNamespace: "npm-cross-link" });

const meta = require("../package");

const argv = require("minimist")(process.argv.slice(2), {
	boolean: [
		"bump-deps", "global", "help", "pull", "push", "save", "dev", "optional", "prod", "version"
	],
	alias: { global: "g", help: "h", version: "v" },
	default: { save: true }
});

const packageNames = argv._;

const usage = `npm-cross-link v${ meta.version }

Usage:

npm-cross-link                                            (in package dir)
npm-cross-link    ...[<@scope>/]<name>[@<version range>]  (in package dir)
npm-cross-link -g ...[<@scope>/]<name>

common-options: [-h | --help] [--pull] [--push]

    --pull        Pull changes from remote (for maintained packages)
		--push        Push committed changes to remote (for maintained packages)
    --help,   -h  Show this message
    --global, -g  Install package globally

o npm-cross-link (in package dir)

		Ensure all project dependencies are up to date, and are setup completely in their folder.
		Global installations (or local project folders in case of maintained package) are linked
		if dependency references latest version.
		Update package.json dependencies section with updated version ranges

		Additonal options:

		    --bump-deps  Bump version ranges of dependencies in package.json

o npm-cross-link ...[<@scope>/]<name>[@<version range>]

		Install given dependencies (link if reference latest version).
		Update version range in package.json.

		Additonal options:

		    --no-save   Do not add dependency to package.json if it's not listed there
				--dev       Save dependency in devDependencies
				--optional  Save dependency in optionalDependencies
				--prod      Save dependency in dependencies (default for new dependency)

o npm-cross-link -g ...[<@scope>/]<name>

		Install latest versions of given packages globally. Maintained packages, are setup
		(or updated if needed) in user packages (~/.npm-packages by default) folder.

`;

if (argv.help) {
	process.stdout.write(usage);
	return;
}

if (argv.version) {
	process.stdout.write(`${ meta.version }\n`);
	return;
}

require("../lib/private/cli")("install", packageNames, {
	bumpDeps: argv["bump-deps"],
	global: argv.global,
	pull: argv.pull,
	push: argv.push,
	noSave: !argv.save,
	saveMode: (() => {
		if (argv.dev) return "dev";
		if (argv.optional) return "optional";
		if (argv.prod) return "prod";
		return "as-is-or-prod";
	})()
});
