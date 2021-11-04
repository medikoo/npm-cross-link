"use strict";

const log                 = require("log").get("npm-cross-link")
    , isSymlink           = require("fs2/is-symlink")
    , rm                  = require("fs2/rm")
    , NpmCrossLinkError   = require("../../../npm-cross-link-error")
    , runProgram          = require("../../../run-program")
    , installExternal     = require("../install-external")
    , muteErrorIfOptional = require("../mute-error-if-optional")
    , resolveIsToBeLinked = require("./resolve-is-to-be-linked");

module.exports = async (dependencyContext, userConfiguration, progressData) => {
	const { linkedPath, name, path, dependentContext } = dependencyContext;
	const isToBeLinked = await resolveIsToBeLinked(
		dependencyContext, userConfiguration, progressData
	);

	if (!isToBeLinked) {
		await installExternal(dependencyContext);
		return;
	}
	const { externalContext } = dependencyContext
	    , { globallyInstalledVersion, latestVersion } = externalContext;

	if (globallyInstalledVersion !== latestVersion) {
		if (globallyInstalledVersion) {
			log.notice(
				"external dependency %s outdated at global folder (got %s expected %s), upgrading",
				name, globallyInstalledVersion, latestVersion
			);
		} else {
			log.notice("external dependency %s not linked at global folder, linking", name);
		}
		// Global node_modules hosts outdated version, cleanup
		await rm(linkedPath, { loose: true, recursive: true, force: true });
	} else if (await isSymlink(path, { linkPath: linkedPath })) {
		return;
	}
	if (!latestVersion) {
		throw new NpmCrossLinkError(`Cannot install non published ${ name }`);
	}

	dependentContext.installationJobs.add(`install-dependency:${ name }`);
	log.info("%s link external dependency %s", dependentContext.name, name);
	await rm(path, { loose: true, recursive: true, force: true });
	await muteErrorIfOptional(dependencyContext, async () => {
		await runProgram(
			"npm",
			[
				"link", "--force", "--legacy-peer-deps", "--ignore-scripts", "--no-package-lock",
				`${ name }@${ latestVersion }`
			],
			{ cwd: dependentContext.path, logger: log.levelRoot.get("npm:link") }
		);
		externalContext.globallyInstalledVersion = latestVersion;
	});
};
