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

const getVersionRange = ({ dependent, name }) => {
	if (dependent.packageJson.dependencies && dependent.packageJson.dependencies[name]) {
		return dependent.packageJson.dependencies[name];
	}
	if (dependent.packageJson.devDependencies && dependent.packageJson.devDependencies[name]) {
		return dependent.packageJson.devDependencies[name];
	}
	return dependent.packageJson.optionalDependencies[name];
};

const getCurrentLinkVersion = async ({ linkedPath }) => {
	// Accept installation only if in directory (not symlink)
	if (!(await isDirectory(linkedPath))) return null;
	return optionalChaining(getPackageJson(linkedPath), "version") || null;
};

const getLatestSupportedVersion = async ({ dependent, name, versionRange }) => {
	if (!semver.validRange(versionRange)) {
		log.warning("%s references %s not by semver range %s", dependent.name, name, versionRange);
		return null;
	}
	const latestSupportedVersion =
		semver.maxSatisfying(await resolveStableVersions(name), versionRange) ||
		semver.maxSatisfying(await getVersions(name), versionRange);
	if (latestSupportedVersion) return latestSupportedVersion;

	log.error(
		"%s references %s with not satisfiable version range %s", dependent.name, name, versionRange
	);
	return null;
};

module.exports = async (dependencyContext, progressData) => {
	const { name } = dependencyContext;
	const { externalsMap } = progressData;
	if (!externalsMap.has(name)) {
		const metadata = await getMetadata(name);
		externalsMap.set(name, {
			currentLinkVersion: await getCurrentLinkVersion(dependencyContext),
			latestVersion: metadata["dist-tags"].latest,
			metadata
		});
		log.debug("resolved %s (external dependency) meta %o", name, externalsMap.get(name));
	}
	dependencyContext.externalContext = externalsMap.get(name);
	dependencyContext.versionRange = getVersionRange(dependencyContext);
	dependencyContext.latestSupportedVersion = await getLatestSupportedVersion(dependencyContext);
};
