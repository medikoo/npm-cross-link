"use strict";

const optionalChaining       = require("es5-ext/optional-chaining")
    , log                    = require("log").get("npm-cross-link")
    , isDirectory            = require("fs2/is-directory")
    , isSymlink              = require("fs2/is-symlink")
    , rm                     = require("fs2/rm")
    , runProgram             = require("../../../run-program")
    , getPackageJson         = require("../../get-package-json")
    , installExternal        = require("./install-external")
    , resolveExternalContext = require("./resolve-external-context")
    , muteErrorIfOptional    = require("./mute-error-if-optional");

module.exports = async (dependencyContext, progressData) => {
	await resolveExternalContext(dependencyContext, progressData);
	const {
		latestSupportedPublishedVersion,
		linkedPath,
		name,
		path,
		dependentContext,
		externalContext,
		versionRange
	} = dependencyContext;
	const { globallyInstalledVersion, latestVersion } = externalContext;

	if (latestSupportedPublishedVersion !== latestVersion) {
		// Latest version not supported, therefore dependency is installed directly (not linked)
		if (latestSupportedPublishedVersion) {
			log.warn(
				"%s depends on outdated %s %s version", dependentContext.name, name, versionRange
			);
		}
		// Expects outdated version, therefore do not link but install in place (if needed)
		if (
			(await isDirectory(path)) &&
			optionalChaining(getPackageJson(path), "version") === latestSupportedPublishedVersion
		) {
			// Up to date
			return;
		}
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
