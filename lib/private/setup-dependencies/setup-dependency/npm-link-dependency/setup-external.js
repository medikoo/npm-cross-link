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
		dependencyName,
		dependencyPath,
		dependent,
		externalMeta: { currentLinkVersion, latestVersion },
		versionRange
	} = dependencyContext;

	if (latestSupportedVersion !== latestVersion) {
		// Latest version not supported, therefore dependency is installed directly (not linked)
		if (!latestSupportedVersion) {
			// Non semver version range, install in place
			await rm(dependencyPath, { loose: true, recursive: true, force: true });
			await muteErrorIfOptional(dependencyContext, () =>
				runProgram("npm", ["install", dependencyName], {
					cwd: dependent.path,
					logger: log.levelRoot.get("npm:install")
				})
			);
			return;
		}

		log.warn(
			"%s depends on outdated %s version (%s)", dependent.name, dependencyName, versionRange
		);
		// Expects outdated version, therefore do not link but install in place (if needed)
		if (
			(await isDirectory(dependencyPath)) &&
			optionalChaining(getPackageJson(dependencyPath), "version") === latestSupportedVersion
		) {
			// Up to date
			return;
		}
		await installExternal(dependencyContext);
		return;
	}

	// Lastest version supported, ensure it's linked
	if (currentLinkVersion !== latestVersion) {
		log.notice(
			"external dependency %s outdated at global folder (got %s expected %s), upgrading",
			dependencyName, currentLinkVersion, latestVersion
		);
		// Global node_modules hosts outdated version, cleanup
		await rm(linkedPath, { loose: true, recursive: true, force: true });
	} else if (await isSymlink(dependencyPath, { linkPath: linkedPath })) {
		return;
	}

	log.info("%s link external dependency %s", dependent.name, dependencyName);
	await rm(dependencyPath, { loose: true, recursive: true, force: true });
	await muteErrorIfOptional(dependencyContext, () =>
		runProgram("npm", ["link", `${ dependencyName }@${ latestVersion }`], {
			cwd: dependent.path,
			logger: log.levelRoot.get("npm:link")
		})
	);
};
