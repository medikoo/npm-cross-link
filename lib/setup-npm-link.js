"use strict";

const isObject          = require("es5-ext/object/is-object")
    , memoizee          = require("memoizee")
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

const resolveExternalDependencyUpgradeVersion = async (
	packageName,
	packagePath,
	dependencyName,
	linkedPath
) => {
	const dependencyVersionRange = getDependencyVersionRange(packagePath, dependencyName);
	if (!semver.validRange(dependencyVersionRange)) {
		log.warning(
			"%s references %s not by semver range %s opting out from upgrade process", packageName,
			dependencyName, dependencyVersionRange
		);
		return null;
	}
	const latestSupportedVersion = semver.maxSatisfying(
		await getAllPackageVersions(dependencyName), dependencyVersionRange
	);
	if (!latestSupportedVersion) {
		log.error(
			"%s references %s with not satisfiable version range %s", packageName, dependencyName,
			dependencyVersionRange
		);
		return null;
	}

	if (await isDirectory(linkedPath)) {
		const installedVersion = JSON.parse(await readFile(resolve(linkedPath, "package.json")))
			.version;
		if (installedVersion === latestSupportedVersion) return null;
		if (semver.gt(installedVersion, latestSupportedVersion)) {
			log.error(
				"%s expects %s in range %s when linked version reflects %s", packageName,
				dependencyName, dependencyVersionRange, installedVersion
			);
			return null;
		}
	}
	log.notice("upgrading external %s to %s", dependencyName, latestSupportedVersion);
	return latestSupportedVersion;
};

module.exports = async (packageName, packagePath, dependencyName, options = {}) => {
	if (!isObject(options)) options = {};
	const dependencyLinkPath = resolve(packagePath, "node_modules", dependencyName);
	const linkedPath = resolve(await getNpmModulesPath(), dependencyName);
	const linkVersion =
		options.isExternal &&
		(await resolveExternalDependencyUpgradeVersion(
			packageName, packagePath, dependencyName, linkedPath
		));
	if (linkVersion) await rm(linkedPath, { loose: true, recursive: true, force: true });

	if (!linkVersion && (await isValidSymlink(dependencyLinkPath, linkedPath))) return;
	log.info("%s link dependency %s", packageName, dependencyName);
	await rm(dependencyLinkPath, { loose: true, recursive: true, force: true });
	await runProgram("npm", ["link", dependencyName + (linkVersion ? `@${ linkVersion }` : "")], {
		cwd: packagePath,
		logger: log.levelRoot.get("npm:link")
	});
};
