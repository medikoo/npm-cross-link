#!/usr/bin/env node

"use strict";

Error.stackTraceLimit = Infinity;

process.on("unhandledRejection", reason => { throw reason; });

require("log4-nodejs")();

const meta = require("../package")
    , argv = require("minimist")(process.argv.slice(2));

const usage = `dev-package-install v${ meta.version } - Install dev package

Usage: dev-package-install package-name

Options:

    --version, -v  Display version
    --help,    -h  Show this message

`;

if (argv.h || argv.help) {
	process.stdout.write(usage);
	return;
}

if (argv.v || argv.version) {
	process.stdout.write(`${ meta.version }\n`);
	return;
}

const [packageName] = argv._;

if (!packageName) {
	process.stderr.write(`Provide package name to install\n\n${ usage }`);
	process.exit(1);
}

const clc                      = require("cli-color")
    , DevPackageInstallError   = require("../lib/dev-package-install-error")
    , installPackage           = require("../lib/install-package")
    , resolveUserConfiguration = require("../lib/resolve-user-configuration");

resolveUserConfiguration()
	.then(configuration => installPackage(packageName, configuration))
	.catch(error => {
		if (error instanceof DevPackageInstallError) {
			process.stdout.write(`\n${ clc.red(error.message) }\n`);
			process.exit(1);
			return;
		}
		throw error;
	});
