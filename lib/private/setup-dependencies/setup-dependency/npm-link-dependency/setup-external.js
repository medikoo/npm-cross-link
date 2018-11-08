"use strict";

const optionalChaining    = require("es5-ext/optional-chaining")
    , log                 = require("log4").get("dev-package")
    , isDirectory         = require("fs2/is-directory")
    , isSymlink           = require("fs2/is-symlink")
    , rm                  = require("fs2/rm")
    , runProgram          = require("../../../../run-program")
    , getPackageJson      = require("../../../get-package-json")
    , installExternal     = require("./install-external")
    , resolveExternalMeta = require("./resolve-external-meta")
    , muteErrorIfOptional = require("./mute-error-if-optional");

module.exports = async (dependencyContext, progressData) => {
	await resolveExternalMeta(dependencyContext, progressData);
	const {
		latestSupportedVersion,
		linkedPath,
		name,
		path,
		dependent,
		versionRange
	} = dependencyContext;
	const externalMeta = progressData.externalsMap.get(name);
	const { currentLinkVersion, latestVersion } = externalMeta;

	if (latestSupportedVersion !== latestVersion) {
		// Latest version not supported, therefore dependency is installed directly (not linked)
		if (!latestSupportedVersion) {
			// Non semver version range, install in place
			await rm(path, { loose: true, recursive: true, force: true });
			await muteErrorIfOptional(dependencyContext, () =>
				runProgram("npm", ["install", name], {
					cwd: dependent.path,
					logger: log.levelRoot.get("npm:install")
				})
			);
			return;
		}

		log.warn("%s depends on outdated %s version (%s)", dependent.name, name, versionRange);
		// Expects outdated version, therefore do not link but install in place (if needed)
		if (
			(await isDirectory(path)) &&
			optionalChaining(getPackageJson(path), "version") === latestSupportedVersion
		) {
			// Up to date
			return;
		}
		await installExternal(dependencyContext, progressData);
		return;
	}

	// Lastest version supported, ensure it's linked
	if (currentLinkVersion !== latestVersion) {
		log.notice(
			"external dependency %s outdated at global folder (got %s expected %s), upgrading",
			name, currentLinkVersion, latestVersion
		);
		// Global node_modules hosts outdated version, cleanup
		await rm(linkedPath, { loose: true, recursive: true, force: true });
	} else if (await isSymlink(path, { linkPath: linkedPath })) {
		return;
	}

	log.info("%s link external dependency %s", dependent.name, name);
	await rm(path, { loose: true, recursive: true, force: true });
	await muteErrorIfOptional(dependencyContext, async () => {
		await runProgram("npm", ["link", `${ name }@${ latestVersion }`], {
			cwd: dependent.path,
			logger: log.levelRoot.get("npm:link")
		});
		externalMeta.currentLinkVersion = latestVersion;
	});
};
