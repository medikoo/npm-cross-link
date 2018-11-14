"use strict";

const log                      = require("log4").get("npm-cross-link")
    , clc                      = require("cli-color")
    , format                   = require("cli-sprintf-format")
    , cliFooter                = require("cli-progress-footer")()
    , NpmCrossLinkError        = require("../../npm-cross-link-error")
    , resolveUserConfiguration = require("../resolve-user-configuration")
    , install                  = require("../../../install")
    , installPackage           = require("../../../install-package")
    , updateAll                = require("../../../update-all");

module.exports = async (command, packageName, inputOptions) => {
	cliFooter.shouldAddProgressAnimationPrefix = true;
	cliFooter.updateProgress(["resolving user configuration"]);

	const userConfiguration = await resolveUserConfiguration();
	const installPromise = (() => {
		if (command === "update-all") return updateAll(userConfiguration, inputOptions);
		return packageName
			? installPackage(packageName, userConfiguration, inputOptions)
			: install(process.cwd(), userConfiguration, inputOptions);
	})();
	const { progressData } = installPromise;
	const { ongoing } = progressData;

	const logWordForms = {
		present: { install: "installing", update: "updating" },
		past: { install: "installed", update: "updated" }
	};
	const updateProgress = () => {
		cliFooter.updateProgress(
			Array.from(ongoing, ([inProgressPackageName, { type }]) =>
				format(`${ logWordForms.present[type] } %s`, inProgressPackageName)
			)
		);
	};
	progressData.on("start", updateProgress);
	progressData.on("end", ({ name: endedPackageName, progressData: packageProgressData }) => {
		const { type } = packageProgressData;
		log.notice(`${ logWordForms.past[type] } %s`, endedPackageName);
		updateProgress();
	});
	try {
		await installPromise;
	} catch (error) {
		cliFooter.updateProgress();
		if (error instanceof NpmCrossLinkError) {
			process.stdout.write(`\n${ clc.red(error.message) }\n`);
			process.exit(1);
			return;
		}
		throw error;
	}
};
