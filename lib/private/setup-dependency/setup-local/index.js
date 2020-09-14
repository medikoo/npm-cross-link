"use strict";

const isSymlink              = require("fs2/is-symlink")
    , stat                   = require("fs2/stat")
    , semver                 = require("semver")
    , log                    = require("log").get("npm-cross-link")
    , resolveExternalContext = require("../../resolve-external-context")
    , installExternal        = require("../install-external")
    , resolveLogLevel        = require("../resolve-log-level")
    , resolveLocalContext    = require("./resolve-local-context")
    , generateLink           = require("./generate-link");

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const {
		dependentContext,
		linkedPath,
		name,
		path,
		versionRange,
		isSemVerVersionRange
	} = dependencyContext;

	if (versionRange && !isSemVerVersionRange) {
		log.info(
			"%s will have %s installed externally, as it's not referenced by semver range",
			dependentContext.name, name
		);
		await installExternal(dependencyContext);
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
			await installExternal(dependencyContext);
			return;
		}
		log.error(
			"%s references %s by non-existing %s version (while linked to %s)",
			dependentContext.name, name, versionRange, localVersion || "<none>"
		);
	}

	if (
		(
			await Promise.all([
				isSymlink(path, { linkPath: linkedPath }),
				// In valid scenarios `linkedPath` exists.
				// It may not, if maintained package was referenced in its repository
				// (in currently checkout state) under different name than one provided in config
				stat(linkedPath, { loose: true }).then(stats => {
					if (!stats) {
						log.error(
							"%s references %s which exposed itself under different name",
							dependentContext.name, name
						);
					}
					return stats;
				})
			])
		).every(Boolean)
	) {
		const dependencyInstallationJobs = (done.get(name) || ongoing.get(name)).installationJobs;
		if (dependencyInstallationJobs.size) {
			dependentContext.installationJobs.add(
				`${ dependencyInstallationJobs.has("clone") ? "install" : "update" }-dependency:${
					name
				}`
			);
		}
		return;
	}

	dependentContext.installationJobs.add(`install-dependency:${ name }`);
	if (ongoing.has(name)) {
		ongoing.get(name).installationHooks.after.push(() => generateLink(dependencyContext));
		return;
	}
	await generateLink(dependencyContext);
};
