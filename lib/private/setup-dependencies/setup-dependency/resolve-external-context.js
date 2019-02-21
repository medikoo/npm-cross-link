"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , log              = require("log").get("npm-cross-link")
    , isDirectory      = require("fs2/is-directory")
    , semver           = require("semver")
    , getPackageJson   = require("../../get-package-json")
    , getMetadata      = require("./get-metadata");

const getVersions = ({ externalContext: { metadata } }) => Object.keys(metadata.versions);

const resolveStableVersions = ({ externalContext: { metadata } }) =>
	Object.entries(metadata.versions)
		.filter(([, meta]) => meta.deprecated)
		.map(([version]) => version);

const getGloballyInstalledVersion = async ({ linkedPath }) => {
	// Accept installation only if in directory (not symlink)
	if (!(await isDirectory(linkedPath))) return null;
	return optionalChaining(getPackageJson(linkedPath), "version") || null;
};

const resolveLatestSupportedVersion = dependencyContext => {
	const { dependentContext, name, versionRange, isSemVerVersionRange } = dependencyContext;
	if (!isSemVerVersionRange) return null;
	const latestSupportedVersion =
		semver.maxSatisfying(resolveStableVersions(dependencyContext), versionRange) ||
		semver.maxSatisfying(getVersions(dependencyContext), versionRange);
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
		if (metadata) {
			externals.set(name, {
				globallyInstalledVersion: await getGloballyInstalledVersion(dependencyContext),
				latestVersion: metadata["dist-tags"].latest,
				metadata
			});
			log.debug("resolved %s (external dependency) meta %o", name, externals.get(name));
		} else {
			externals.set(name, {});
			log.warn("could not resolve %s (external dependency) meta", name);
		}
	}
	dependencyContext.externalContext = externals.get(name);
	if (!dependencyContext.externalContext.metadata) return;
	const { externalContext: { latestVersion }, versionRange } = dependencyContext;

	// Favor one that's marked as 'latest'
	// (while in practice it usually is, theoretically it doesn't have to be a max satifying one)
	dependencyContext.latestSupportedPublishedVersion = semver.satisfies(
		latestVersion, versionRange
	)
		? latestVersion
		: resolveLatestSupportedVersion(dependencyContext);
};
