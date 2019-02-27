"use strict";

const log                     = require("log").get("npm-cross-link")
    , isSymlink               = require("fs2/is-symlink")
    , rm                      = require("fs2/rm")
    , runProgram              = require("../../run-program")
    , resolveExternalContext  = require("../resolve-external-context")
    , nonOverridableExternals = require("../non-overridable-externals")
    , installExternal         = require("./install-external")
    , muteErrorIfOptional     = require("./mute-error-if-optional")
    , resolveLogLevel         = require("./resolve-log-level");

module.exports = async (dependencyContext, progressData) => {
	const {
		linkedPath,
		name,
		path,
		dependentContext,
		versionRange,
		isSemVerVersionRange
	} = dependencyContext;
	if (versionRange && !isSemVerVersionRange) {
		await installExternal(dependencyContext);
		return;
	}
	const externalContext = await resolveExternalContext(dependencyContext, progressData);
	const { globallyInstalledVersion, latestVersion } = externalContext;
	if (nonOverridableExternals.has(name)) {
		await installExternal(dependencyContext);
		return;
	}
	const { latestSupportedPublishedVersion } = dependencyContext;
	if (!latestSupportedPublishedVersion) {
		log.error(
			"%s depends on non-published %s %s version", dependentContext.name, name, versionRange
		);
	} else if (latestSupportedPublishedVersion !== latestVersion) {
		// Latest version not supported, therefore dependency is installed directly (not linked)
		log[resolveLogLevel(dependentContext, progressData)](
			"%s depends on outdated %s %s version", dependentContext.name, name, versionRange
		);
		// Expects outdated version, therefore do not link but install in place (if needed)
		await installExternal(dependencyContext);
		return;
	}

	// Lastest version supported, ensure it's linked
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

	dependentContext.installationJobs.add(`install-dependency:${ name }`);
	log.info("%s link external dependency %s", dependentContext.name, name);
	await rm(path, { loose: true, recursive: true, force: true });
	await muteErrorIfOptional(dependencyContext, async () => {
		await runProgram("npm", ["link", `${ name }@${ latestVersion }`], {
			cwd: dependentContext.path,
			logger: log.levelRoot.get("npm:link")
		});
		externalContext.globallyInstalledVersion = latestVersion;
	});
};
