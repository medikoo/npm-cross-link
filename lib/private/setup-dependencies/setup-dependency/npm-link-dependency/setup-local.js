"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , isSymlink        = require("fs2/is-symlink")
    , rm               = require("fs2/rm")
    , semver           = require("semver")
    , log              = require("log").get("npm-cross-link")
    , getPackageJson   = require("../../../get-package-json")
    , runProgram       = require("../../../../run-program");

const validateVersion = dependencyContext => {
	const { dependentContext, name, linkedPath, versionRange } = dependencyContext;
	const currentVersion = optionalChaining(getPackageJson(linkedPath), "version");
	if (currentVersion && !semver.satisfies(currentVersion, versionRange)) {
		log.error(
			"%s references %s by outdated %s version (while linked to %s)", dependentContext.name,
			name, versionRange, currentVersion
		);
	}
};

const generateLink = async (dependencyContext, isVersionRangeValid) => {
	const { dependentContext, name, path } = dependencyContext;
	log.info("%s link dependency %s", dependentContext.name, name);
	await rm(path, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", name], {
		cwd: dependentContext.path,
		logger: log.levelRoot.get("npm:link")
	});
	if (isVersionRangeValid) validateVersion(dependencyContext);
};

module.exports = async (dependencyContext, progressData) => {
	const { dependentContext, linkedPath, name, path, versionRange } = dependencyContext;
	const { ongoing } = progressData;
	const isVersionRangeValid = semver.validRange(versionRange);
	if (await isSymlink(path, { linkPath: linkedPath })) {
		if (isVersionRangeValid) validateVersion(dependencyContext);
		return;
	}

	dependentContext.installationJobs.add(`install-dependency:${ name }`);
	if (ongoing.has(name)) {
		ongoing
			.get(name)
			.installationHooks.after.push(() =>
				generateLink(dependencyContext, isVersionRangeValid)
			);
		return;
	}
	await generateLink(dependencyContext, isVersionRangeValid);
};
