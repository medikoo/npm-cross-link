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
	const { dependent, dependency } = dependencyContext;
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
	dependencyContext.versionRange = getVersionRange(dependent.packageJson, dependency.name);
	dependencyContext.latestSupportedVersion = await getLatestSupportedVersion(dependencyContext);
};
