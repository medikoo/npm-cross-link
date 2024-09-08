"use strict";

const { dirname, relative }        = require("path")
    , isSymlink                    = require("fs2/is-symlink")
    , lstat                        = require("fs2/lstat")
    , rm                           = require("fs2/rm")
    , symlink                      = require("fs2/symlink")
    , semver                       = require("semver")
    , log                          = require("log").get("npm-cross-link")
    , getPackageJson               = require("../../get-package-json")
    , resolveExternalContext       = require("../../resolve-external-context")
    , resolveMaintainedPackagePath = require("../../resolve-maintained-package-path")
    , resolveLogLevel              = require("../../utils/resolve-log-level")
    , resolveLocalContext          = require("../../resolve-local-context")
    , installExternal              = require("../install-external")
    , mapBinaries                  = require("../binary-handler/map")
    , isCoherent                   = require("../binary-handler/is-coherent");

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependentContext, name, path, versionRange, isSemVerVersionRange } = dependencyContext;

	if (versionRange && !isSemVerVersionRange) {
		log.info(
			"%s will have %s installed externally, as it's not referenced by semver range",
			dependentContext.name, name
		);
		await installExternal(dependencyContext, userConfiguration, progressData);
		return;
	}
	const { ongoing, done } = progressData;
	// Esure we have it installed locally
	if (!ongoing.has(name) && !done.has(name)) {
		// Cyclic module dependency, hence required on spot
		await require("../../install-maintained-package")(
			{ name }, userConfiguration, inputOptions, progressData
		);
	}
	const { localVersion } = resolveLocalContext(
		dependencyContext, userConfiguration, progressData
	);
	await resolveExternalContext(dependencyContext, progressData);
	if (
		versionRange &&
		versionRange !== "latest" &&
		(!localVersion || !semver.satisfies(localVersion, versionRange))
	) {
		if (dependencyContext.latestSupportedPublishedVersion) {
			if (localVersion) {
				log[resolveLogLevel(dependentContext, progressData)](
					"%s references %s by %s version range, which doesn't match the local one %s",
					dependentContext.name, name, versionRange, localVersion
				);
			} else {
				log.info(
					"%s will have %s installed externally as it has no version configured",
					dependentContext.name, name
				);
			}
			// Expects outdated version, therefore do not link but install in place (if needed)
			await installExternal(dependencyContext, userConfiguration, progressData);
			return;
		}
		log.error(
			"%s references %s by non-existing %s version (while linked to %s)",
			dependentContext.name, name, versionRange, localVersion || "<none>"
		);
	}

	const linkedPath = relative(
		dirname(path), resolveMaintainedPackagePath(name, userConfiguration)
	);
	if (await isSymlink(path, { linkPath: linkedPath })) {
		if (await isCoherent(dependencyContext, getPackageJson(path))) return;
		log.notice("%s binaries not coherent %s, relinking", dependentContext.name, name);
	} else {
		log.info(
			"%s dependency %s at %s doesn't resemble %s", dependentContext.name, name, path,
			linkedPath
		);
		const isInstalled = await lstat(path, { loose: true });
		await rm(path, { loose: true, recursive: true, force: true });
		await symlink(linkedPath, path, { intermediate: true });
		dependentContext.installationJobs.add(
			`${ isInstalled ? "update" : "install" }-dependency:${ name }`
		);
		log.notice("%s linking %s (as maintained package)", dependentContext.name, name);
	}
	await mapBinaries(dependencyContext);
};
