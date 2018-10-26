#!/usr/bin/env node

"use strict";

Error.stackTraceLimit = Infinity;

process.on("unhandledRejection", reason => { throw reason; });

require("log4-nodejs")({ defaultNamespace: "dev-package" });

const meta = require("../package")
    , argv = require("minimist")(process.argv.slice(2), { boolean: "skip-git-update" });

const usage = `dev-package v${ meta.version } - Install dev package

Usage: dev-package <command>

where <command> is one of:
    install, update

Options:

    --skip-git-update      Do not 'git pull' on update
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

const supportedCommands = new Set(["install", "update"]);

if (!supportedCommands.has(command)) {
	process.stderr.write(`${ command } is not a suppported command\n\n${ usage }`);
	process.exit(1);
}

if (!packageName) {
	process.stderr.write(`Provide package name to install\n\n${ usage }`);
	process.exit(1);
}

const log                      = require("log4").get("dev-package")
    , clc                      = require("cli-color")
    , format                   = require("cli-sprintf-format")
    , cliFooter                = require("cli-progress-footer")()
    , DevPackageError          = require("../lib/dev-package-error")
    , resolveUserConfiguration = require("../lib/resolve-user-configuration")
    , installPackage           = require("../");

cliFooter.shouldAddProgressAnimationPrefix = true;
cliFooter.updateProgress(["resolving user configuration"]);

(async () => {
	const configuration = await resolveUserConfiguration();
	const installPromise = installPackage(packageName, configuration, {
		skipGitUpdate: argv["skip-git-update"]
	});

	const installsInProgress = new Map();

	const logWordForms = {
		present: { install: "installing", update: "updating" },
		past: { install: "installed", update: "updated" }
	};
	const updateProgress = () => {
		cliFooter.updateProgress(
			Array.from(installsInProgress, ([inProgressPackageName, { type }]) =>
				format(`${ logWordForms.present[type] } %s`, inProgressPackageName)
			)
		);
	};
	installPromise.on("start", event => {
		installsInProgress.set(event.name, event);
		updateProgress();
	});
	installPromise.on("end", ({ name: endedPackageName }) => {
		const { type } = installsInProgress.get(endedPackageName);
		installsInProgress.delete(endedPackageName);
		log.notice(`${ logWordForms.past[type] } %s`, endedPackageName);
		updateProgress();
	});
	try {
		await installPromise;
	} catch (error) {
		if (error instanceof DevPackageError) {
			process.stdout.write(`\n${ clc.red(error.message) }\n`);
			process.exit(1);
			return;
		}
		throw error;
	}
})();
