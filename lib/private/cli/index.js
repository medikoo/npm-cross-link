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
		present: { install: "installing", update: "processing" },
		past: { install: "installed", update: "processed" }
	};
	const updateProgress = () => {
		cliFooter.updateProgress(
			Array.from(ongoing, ([inProgressPackageName, { installationType }]) =>
				format(`${ logWordForms.present[installationType] } %s`, inProgressPackageName)
			)
		);
	};
	progressData.on("start", updateProgress);
	progressData.on("end", ({ name: endedPackageName, installationType, installationJobs }) => {
		if (installationType === "install") {
			log.notice("installed %s", endedPackageName);
		} else if (installationJobs.size) {
			const jobTerms = new Set();
			let updatedDependenciesCount = 0;
			for (const job of installationJobs) {
				if (job === "pull") jobTerms.add("pulled");
				else if (job === "push") jobTerms.add("pushed");
				else if (job.startsWith("setup-dependency:")) ++updatedDependenciesCount;
			}
			if (updatedDependenciesCount === 1) {
				jobTerms.add("updated 1 dependency");
			} else if (updatedDependenciesCount > 1) {
				jobTerms.add(`updated ${ updatedDependenciesCount } dependencies`);
			}
			log.notice("updated %s (%#s)", endedPackageName, Array.from(jobTerms).join(", "));
		}
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
