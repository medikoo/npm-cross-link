"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , log              = require("log").get("npm-cross-link")
    , isDirectory      = require("fs2/is-directory")
    , semver           = require("semver")
    , getPackageJson   = require("../../get-package-json")
    , getMetadata      = require("./get-metadata");

const getVersions = async dependencyName =>
	Object.keys((await getMetadata(dependencyName)).versions);

const resolveStableVersions = async dependencyName =>
	Object.entries((await getMetadata(dependencyName)).versions)
		.filter(([, meta]) => meta.deprecated)
		.map(([version]) => version);

const getGloballyInstalledVersion = async ({ linkedPath }) => {
	// Accept installation only if in directory (not symlink)
	if (!(await isDirectory(linkedPath))) return null;
	return optionalChaining(getPackageJson(linkedPath), "version") || null;
};

const getLatestSupportedVersion = async ({ dependentContext, name, versionRange }) => {
	if (!semver.validRange(versionRange)) return null;
	const latestSupportedVersion =
		semver.maxSatisfying(await resolveStableVersions(name), versionRange) ||
		semver.maxSatisfying(await getVersions(name), versionRange);
	if (latestSupportedVersion) return latestSupportedVersion;

	log.error(
		"%s references %s with not satisfiable version range %s", dependentContext.name, name,
		versionRange
	);
	return null;
};

module.exports = async (dependencyContext, progressData) => {
	const { name } = dependencyContext;
	const { externals } = progressData;
	if (!externals.has(name)) {
		const metadata = await getMetadata(name);
		externals.set(name, {
			globallyInstalledVersion: await getGloballyInstalledVersion(dependencyContext),
			latestVersion: metadata["dist-tags"].latest,
			metadata
		});
		log.debug("resolved %s (external dependency) meta %o", name, externals.get(name));
	}
	dependencyContext.externalContext = externals.get(name);
	dependencyContext.latestSupportedVersion = await getLatestSupportedVersion(dependencyContext);
};
