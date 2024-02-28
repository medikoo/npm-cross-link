"use strict";

const isSymlink              = require("fs2/is-symlink")
    , realpath               = require("fs2/realpath")
    , stat                   = require("fs2/stat")
    , semver                 = require("semver")
    , log                    = require("log").get("npm-cross-link")
    , resolveExternalContext = require("../../resolve-external-context")
    , installExternal        = require("../install-external")
    , resolveLogLevel        = require("../resolve-log-level")
    , resolveLocalContext    = require("../../resolve-local-context")
    , generateLink           = require("./generate-link");

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependentContext, linkedPath, name, path, versionRange, isSemVerVersionRange } =
		dependencyContext;

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

	// In valid scenarios `linkedPath` exists.
	// It may not, if maintained package was referenced in its repository
	// (in currently checkout state) under different name than one provided in config
	const stats = await stat(linkedPath, { loose: true });
	if (stats) {
		if (await isSymlink(path, { linkPath: await realpath(linkedPath), recursive: true })) {
			const dependencyInstallationJobs = (done.get(name) || ongoing.get(name))
				.installationJobs;
			if (dependencyInstallationJobs.size) {
				dependentContext.installationJobs.add(
					`${
						dependencyInstallationJobs.has("clone") ? "install" : "update"
					}-dependency:${ name }`
				);
			}
			return;
		}
		log.info(
			"%s dependency %s at %s doesn't resemble %s", dependentContext.name, name, path,
			linkedPath
		);
	} else {
		log.error(
			"%s references %s which exposed itself under different name", dependentContext.name,
			name
		);
	}

	dependentContext.installationJobs.add(`install-dependency:${ name }`);
	if (ongoing.has(name)) {
		ongoing.get(name).installationHooks.after.push(() => generateLink(dependencyContext));
		return;
	}
	await generateLink(dependencyContext);
};
