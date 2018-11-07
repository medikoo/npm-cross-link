"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , log              = require("log4").get("dev-package")
    , isDirectory      = require("fs2/is-directory")
    , semver           = require("semver")
    , getPackageJson   = require("../../../get-package-json")
    , getMetadata      = require("./get-metadata");

const getVersions = async dependencyName =>
	Object.keys((await getMetadata(dependencyName)).versions);

const resolveStableVersions = async dependencyName =>
	Object.entries((await getMetadata(dependencyName)).versions)
		.filter(([, meta]) => meta.deprecated)
		.map(([version]) => version);

const getVersionRange = (dependentPackageJson, dependencyName) => {
	if (dependentPackageJson.dependencies && dependentPackageJson.dependencies[dependencyName]) {
		return dependentPackageJson.dependencies[dependencyName];
	}
	if (
		dependentPackageJson.devDependencies &&
		dependentPackageJson.devDependencies[dependencyName]
	) {
		return dependentPackageJson.devDependencies[dependencyName];
	}
	return dependentPackageJson.optionalDependencies[dependencyName];
};

const getLinkCurrentVersion = async ({ linkedPath }) => {
	// Accept installation only if in directory (not symlink)
	if (!(await isDirectory(linkedPath))) return null;
	return optionalChaining(getPackageJson(linkedPath), "version") || null;
};

const getLatestSupportedVersion = async ({ dependentName, dependencyName, versionRange }) => {
	if (!semver.validRange(versionRange)) {
		log.warning(
			"%s references %s not by semver range %s", dependentName, dependencyName, versionRange
		);
		return null;
	}
	const latestSupportedVersion =
		semver.maxSatisfying(await resolveStableVersions(dependencyName), versionRange) ||
		semver.maxSatisfying(await getVersions(dependencyName), versionRange);
	if (latestSupportedVersion) return latestSupportedVersion;

	log.error(
		"%s references %s with not satisfiable version range %s", dependentName, dependencyName,
		versionRange
	);
	return null;
};

module.exports = async (dependencyContext, progressData) => {
	const { dependentPackageJson, dependencyName } = dependencyContext;
	const { externalsMap } = progressData;
	if (!externalsMap.has(dependencyName)) {
		const metadata = await getMetadata(dependencyName);
		externalsMap.set(dependencyName, {
			currentVersion: await getLinkCurrentVersion(dependencyContext),
			latestVersion: metadata["dist-tags"].latest,
			metadata
		});
		log.debug(
			"resolve %s (external dependency) meta %o", dependencyName,
			externalsMap.get(dependencyName)
		);
	}
	dependencyContext.externalMeta = externalsMap.get(dependencyName);
	dependencyContext.versionRange = getVersionRange(dependentPackageJson, dependencyName);
	dependencyContext.latestSupportedVersion = await getLatestSupportedVersion(dependencyContext);
};
