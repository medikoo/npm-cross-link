"use strict";

const { resolve }       = require("path")
    , log               = require("log4").get("dev-package")
    , isSymlink         = require("fs2/is-symlink")
    , rm                = require("fs2/rm")
    , getNpmModulesPath = require("../../../../get-npm-modules-path")
    , runProgram        = require("../../../../run-program")
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
	dependencyContext.versionRange = getVersionRange(dependencyContext);

	if (isExternal) {
		await setupExternal(dependencyContext, progressData);
		return;
	}

	if (await isSymlink(path, { linkPath: linkedPath })) return;
	log.info("%s link dependency %s", dependentContext.name, name);
	await rm(path, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", name], {
		cwd: dependentContext.path,
		logger: log.levelRoot.get("npm:link")
	});
};
