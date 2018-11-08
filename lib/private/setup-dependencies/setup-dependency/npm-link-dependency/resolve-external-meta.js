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

const getVersionRange = ({ dependent, dependency }) => {
	if (dependent.packageJson.dependencies && dependent.packageJson.dependencies[dependency.name]) {
		return dependent.packageJson.dependencies[dependency.name];
	}
	if (
		dependent.packageJson.devDependencies &&
		dependent.packageJson.devDependencies[dependency.name]
	) {
		return dependent.packageJson.devDependencies[dependency.name];
	}
	return dependent.packageJson.optionalDependencies[dependency.name];
};

const getCurrentLinkVersion = async ({ linkedPath }) => {
	// Accept installation only if in directory (not symlink)
	if (!(await isDirectory(linkedPath))) return null;
	return optionalChaining(getPackageJson(linkedPath), "version") || null;
};

const getLatestSupportedVersion = async ({ dependent, dependency, versionRange }) => {
	if (!semver.validRange(versionRange)) {
		log.warning(
			"%s references %s not by semver range %s", dependent.name, dependency.name, versionRange
		);
		return null;
	}
	const latestSupportedVersion =
		semver.maxSatisfying(await resolveStableVersions(dependency.name), versionRange) ||
		semver.maxSatisfying(await getVersions(dependency.name), versionRange);
	if (latestSupportedVersion) return latestSupportedVersion;

	log.error(
		"%s references %s with not satisfiable version range %s", dependent.name, dependency.name,
		versionRange
	);
	return null;
};

module.exports = async (dependencyContext, progressData) => {
	const { dependency } = dependencyContext;
	const { externalsMap } = progressData;
	if (!externalsMap.has(dependency.name)) {
		const metadata = await getMetadata(dependency.name);
		externalsMap.set(dependency.name, {
			currentLinkVersion: await getCurrentLinkVersion(dependencyContext),
			latestVersion: metadata["dist-tags"].latest,
			metadata
		});
		log.debug(
			"resolve %s (external dependency) meta %o", dependency.name,
			externalsMap.get(dependency.name)
		);
	}
	dependencyContext.externalMeta = externalsMap.get(dependency.name);
	dependencyContext.versionRange = getVersionRange(dependencyContext);
	dependencyContext.latestSupportedVersion = await getLatestSupportedVersion(dependencyContext);
};
