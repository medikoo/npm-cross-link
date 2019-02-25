"use strict";

const optionalChaining       = require("es5-ext/optional-chaining")
    , { resolve }            = require("path")
    , isSymlink              = require("fs2/is-symlink")
    , rm                     = require("fs2/rm")
    , semver                 = require("semver")
    , log                    = require("log").get("npm-cross-link")
    , getPackageJson         = require("../../get-package-json")
    , runProgram             = require("../../../run-program")
    , resolveExternalContext = require("./resolve-external-context")
    , installExternal        = require("./install-external")
    , resolveLogLevel        = require("./resolve-log-level");

const generateLink = async dependencyContext => {
	const { dependentContext, name, path } = dependencyContext;
	log.info("%s link dependency %s", dependentContext.name, name);
	await rm(path, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", name], {
		cwd: dependentContext.path,
		logger: log.levelRoot.get("npm:link")
	});
};

const resolveLocalContext = (dependencyContext, { packagesPath }, { locals }) => {
	const { name } = dependencyContext;
	if (!locals.has(name)) {
		locals.set(name, {
			localVersion:
				optionalChaining(getPackageJson(resolve(packagesPath, name)), "version") || null
		});
		log.debug("resolved %s (local dependency) meta %o", name, locals.get(name));
	}
	return (dependencyContext.localContext = locals.get(name));
};

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const {
		dependentContext,
		linkedPath,
		name,
		path,
		versionRange,
		isSemVerVersionRange
	} = dependencyContext;
	if (!isSemVerVersionRange) {
		await installExternal(dependencyContext);
		return;
	}
	const { ongoing, done } = progressData;
	// Esure we have it installed locally
	if (!ongoing.has(name) && !done.has(name)) {
		// Cyclic module dependency, hence required on spot
		await require("../../install-package")(
			{ name }, userConfiguration, inputOptions, progressData
		);
	}
	const { localVersion } = resolveLocalContext(
		dependencyContext, userConfiguration, progressData
	);
	if (!localVersion || !semver.satisfies(localVersion, versionRange)) {
		await resolveExternalContext(dependencyContext, progressData);
		if (dependencyContext.latestSupportedPublishedVersion) {
			if (localVersion) {
				log[resolveLogLevel(dependentContext, progressData)](
					"%s references %s version %s, which doesn't match local one %s",
					dependentContext.name, name, versionRange, localVersion || "<none>"
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

	if (await isSymlink(path, { linkPath: linkedPath })) {
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
