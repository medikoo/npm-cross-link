"use strict";

const optionalChaining    = require("es5-ext/optional-chaining")
    , { resolve }         = require("path")
    , log                 = require("log4").get("dev-package")
    , isDirectory         = require("fs2/is-directory")
    , isSymlink           = require("fs2/is-symlink")
    , rm                  = require("fs2/rm")
    , getNpmModulesPath   = require("../../../get-npm-modules-path")
    , runProgram          = require("../../../run-program")
    , getPackageJson      = require("../../get-package-json")
    , installExternal     = require("./install-external")
    , resolveExternalMeta = require("./resolve-external-meta");

const setupExternal = async (dependencyContext, progressData) => {
	await resolveExternalMeta(dependencyContext, progressData);
	const {
		latestSupportedVersion,
		linkedPath,
		dependencyName,
		dependencyPath,
		dependentName,
		dependentPath,
		externalMeta: { currentVersion, latestVersion },
		versionRange
	} = dependencyContext;

	if (latestSupportedVersion !== latestVersion) {
		// Latest version not supported, dependency installed directly (not linked)
		if (!latestSupportedVersion) {
			// Non semver version range, install in place
			await rm(dependencyPath, { loose: true, recursive: true, force: true });
			await runProgram("npm", ["install", dependencyName], {
				cwd: dependentPath,
				logger: log.levelRoot.get("npm:install")
			});
			return;
		}

		log.warn(
			"%s depends on outdated %s version (%s)", dependentName, dependencyName, versionRange
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
	if (currentVersion !== latestVersion) {
		log.notice(
			"external dependency %s outdated at global folder (got %s expected %s), upgrading",
			dependencyName, currentVersion, latestVersion
		);
		// Global node_modules hosts outdated version, cleanup
		await rm(linkedPath, { loose: true, recursive: true, force: true });
	} else if (await isSymlink(dependencyPath, { linkPath: linkedPath })) {
		return;
	}

	log.info("%s link external dependency %s", dependentName, dependencyName);
	await rm(dependencyPath, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", `${ dependencyName }@${ latestVersion }`], {
		cwd: dependentPath,
		logger: log.levelRoot.get("npm:link")
	});
};

module.exports = async (dependencyContext, progressData) => {
	const { dependentName, dependentPath, dependencyName, isExternal } = dependencyContext;
	const dependencyPath = (dependencyContext.dependencyPath = resolve(
		dependentPath, "node_modules", dependencyName
	));

	const linkedPath = (dependencyContext.linkedPath = resolve(
		await getNpmModulesPath(), dependencyName
	));

	if (isExternal) {
		await setupExternal(dependencyContext, progressData);
		return;
	}

	if (await isSymlink(dependencyPath, { linkPath: linkedPath })) return;
	log.info("%s link dependency %s", dependentName, dependencyName);
	await rm(dependencyPath, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", dependencyName], {
		cwd: dependentPath,
		logger: log.levelRoot.get("npm:link")
	});
};
