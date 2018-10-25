"use strict";

const memoizee          = require("memoizee")
    , { resolve }       = require("path")
    , log               = require("log4").get("dev-package")
    , readFile          = require("fs2/read-file")
    , rm                = require("fs2/rm")
    , semver            = require("semver")
    , getNpmModulesPath = require("./get-npm-modules-path")
    , isValidSymlink    = require("./is-valid-symlink")
    , isDirectory       = require("./is-directory")
    , runProgram        = require("./run-program");

const getDependencyVersionRange = (packagePath, dependencyName) => {
	const pkgJson = require(resolve(packagePath, "package.json"));
	if (pkgJson.dependencies && pkgJson.dependencies[dependencyName]) {
		return pkgJson.dependencies[dependencyName];
	}
	if (pkgJson.devDependencies && pkgJson.devDependencies[dependencyName]) {
		return pkgJson.devDependencies[dependencyName];
	}
	return pkgJson.optionalDependencies[dependencyName];
};

const getAllPackageVersions = memoizee(
	async dependencyName => {
		const promise = runProgram("npm", ["view", dependencyName, "versions", "--json"]);
		let data = "";
		promise.child.stdout.on("data", chunk => (data += chunk));
		await promise;
		return JSON.parse(data);
	},
	{ promise: true }
);

const resolveExternalDependencyUpgradeVersion = async context => {
	const { dependentName, dependentPath, dependencyName, linkedPath } = context;
	const dependencyVersionRange = getDependencyVersionRange(dependentPath, dependencyName);
	if (!semver.validRange(dependencyVersionRange)) {
		log.warning(
			"%s references %s not by semver range %s opting out from upgrade process",
			dependentName, dependencyName, dependencyVersionRange
		);
		return null;
	}
	const latestSupportedVersion = semver.maxSatisfying(
		await getAllPackageVersions(dependencyName), dependencyVersionRange
	);
	if (!latestSupportedVersion) {
		log.error(
			"%s references %s with not satisfiable version range %s", dependentName, dependencyName,
			dependencyVersionRange
		);
		return null;
	}

	// Accept installation only if in directory (not symlink)
	if (await isDirectory(linkedPath)) {
		const installedVersion = JSON.parse(await readFile(resolve(linkedPath, "package.json")))
			.version;
		if (installedVersion === latestSupportedVersion) return null;
		if (semver.gt(installedVersion, latestSupportedVersion)) {
			log.error(
				"%s expects %s in range %s when linked version reflects %s", dependentName,
				dependencyName, dependencyVersionRange, installedVersion
			);
			return null;
		}
	}
	log.notice("upgrading external %s to %s", dependencyName, latestSupportedVersion);
	await rm(linkedPath, { loose: true, recursive: true, force: true });
	return latestSupportedVersion;
};

module.exports = async context => {
	const { dependentName, dependentPath, dependencyName, isExternal } = context;
	const dependencyLinkPath = resolve(dependentPath, "node_modules", dependencyName);

	const linkedPath = (context.linkedPath = resolve(await getNpmModulesPath(), dependencyName));
	const linkVersion = isExternal && (await resolveExternalDependencyUpgradeVersion(context));
	if (!linkVersion && (await isValidSymlink(dependencyLinkPath, linkedPath))) return;
	log.info("%s link dependency %s", dependentName, dependencyName);
	await rm(dependencyLinkPath, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", dependencyName + (linkVersion ? `@${ linkVersion }` : "")], {
		cwd: dependentPath,
		logger: log.levelRoot.get("npm:link")
	});
};
