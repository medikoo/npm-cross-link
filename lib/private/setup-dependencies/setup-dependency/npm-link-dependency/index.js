"use strict";

const optionalChaining  = require("es5-ext/optional-chaining")
    , { resolve }       = require("path")
    , log               = require("log4").get("dev-package")
    , semver            = require("semver")
    , isSymlink         = require("fs2/is-symlink")
    , rm                = require("fs2/rm")
    , getNpmModulesPath = require("../../../../get-npm-modules-path")
    , runProgram        = require("../../../../run-program")
    , getPackageJson    = require("../../../get-package-json")
    , setupExternal     = require("./setup-external");

const getVersionRange = ({ dependentContext, name }) => {
	if (
		dependentContext.packageJson.dependencies &&
		dependentContext.packageJson.dependencies[name]
	) {
		return dependentContext.packageJson.dependencies[name];
	}
	if (
		dependentContext.packageJson.devDependencies &&
		dependentContext.packageJson.devDependencies[name]
	) {
		return dependentContext.packageJson.devDependencies[name];
	}
	return dependentContext.packageJson.optionalDependencies[name];
};

module.exports = async (dependencyContext, progressData) => {
	const { dependentContext, name, isExternal } = dependencyContext;
	const path = (dependencyContext.path = resolve(dependentContext.path, "node_modules", name));

	const linkedPath = (dependencyContext.linkedPath = resolve(await getNpmModulesPath(), name));
	const versionRange = (dependencyContext.versionRange = getVersionRange(dependencyContext));
	const isVersionRangeValid = semver.validRange(versionRange);
	if (!isVersionRangeValid) {
		log.warning(
			"%s references %s not by semver range %s", dependentContext.name, name, versionRange
		);
	}

	if (isExternal) {
		await setupExternal(dependencyContext, progressData);
		return;
	}

	if (isVersionRangeValid) {
		const currentVersion = optionalChaining(getPackageJson(linkedPath), "version");
		if (currentVersion && !semver.satisfies(currentVersion, versionRange)) {
			log.error(
				"%s references %s by outdated %s version (while linked to %s)",
				dependentContext.name, name, versionRange, currentVersion
			);
		}
	}
	if (await isSymlink(path, { linkPath: linkedPath })) return;
	log.info("%s link dependency %s", dependentContext.name, name);
	await rm(path, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", name], {
		cwd: dependentContext.path,
		logger: log.levelRoot.get("npm:link")
	});
};
