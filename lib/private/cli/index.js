"use strict";

const log                      = require("log4").get("dev-package")
    , clc                      = require("cli-color")
    , format                   = require("cli-sprintf-format")
    , cliFooter                = require("cli-progress-footer")()
    , DevPackageError          = require("../../dev-package-error")
    , resolveUserConfiguration = require("../resolve-user-configuration")
    , installPackage           = require("../../../");

module.exports = async (packageName, inputOptions) => {
	cliFooter.shouldAddProgressAnimationPrefix = true;
	cliFooter.updateProgress(["resolving user configuration"]);

	const installPromise = installPackage(
		packageName, await resolveUserConfiguration(), inputOptions
	);

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
};
