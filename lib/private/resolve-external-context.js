"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , log              = require("log").get("npm-cross-link")
    , isDirectory      = require("fs2/is-directory")
    , semver           = require("semver")
    , getPackageJson   = require("./get-package-json")
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

const resolveLatestSupportedVersion = packageContext => {
	const { dependentContext, name, versionRange, isSemVerVersionRange } = packageContext;
	if (!isSemVerVersionRange) return null;
	const latestSupportedVersion =
		semver.maxSatisfying(resolveStableVersions(packageContext), versionRange) ||
		semver.maxSatisfying(getVersions(packageContext), versionRange);
	if (latestSupportedVersion) return latestSupportedVersion;
	if (!dependentContext) return null;
	log.error(
		"%s references %s with not satisfiable version range %s", dependentContext.name, name,
		versionRange
	);
	return null;
};

module.exports = async (packageContext, progressData) => {
	const { name } = packageContext;
	const { externals } = progressData;
	if (!externals.has(name)) {
		const metadata = await getMetadata(name);
		if (metadata) {
			externals.set(name, {
				globallyInstalledVersion: await getGloballyInstalledVersion(packageContext),
				latestVersion: metadata["dist-tags"].latest,
				metadata
			});
			log.debug("resolved %s (external dependency) meta %o", name, externals.get(name));
		} else {
			externals.set(name, {});
			log.warn("could not resolve %s (external dependency) meta", name);
		}
	}
	packageContext.externalContext = externals.get(name);
	if (!packageContext.externalContext.metadata) return packageContext.externalContext;
	const { externalContext: { latestVersion }, versionRange } = packageContext;
	if (!versionRange) {
		packageContext.latestSupportedPublishedVersion = latestVersion;
		return packageContext.externalContext;
	}
	// Favor one that's marked as 'latest'
	// (while in practice it usually is, theoretically it doesn't have to be a max satifying one)
	packageContext.latestSupportedPublishedVersion = semver.satisfies(latestVersion, versionRange)
		? latestVersion
		: resolveLatestSupportedVersion(packageContext);

	return packageContext.externalContext;
};
