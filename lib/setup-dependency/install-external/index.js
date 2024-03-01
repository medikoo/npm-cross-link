"use strict";

const optionalChaining    = require("es5-ext/optional-chaining")
    , { join, resolve }   = require("path")
    , copyDir             = require("fs2/copy-dir")
    , isDirectory         = require("fs2/is-directory")
    , rm                  = require("fs2/rm")
    , log                 = require("log").get("npm-cross-link")
    , getPackageJson      = require("../../get-package-json")
    , muteErrorIfOptional = require("../mute-error-if-optional")
    , cachePackage        = require("../../cache-package")
    , resolveBinariesDict = require("../../resolve-package-binaries-dict")
    , binaryHandler       = require("./binary-handler");

const mapBinaries = async ({ name, path, dependentContext }) => {
	const binDict = resolveBinariesDict(path);
	if (!binDict) return;
	await Promise.all(
		Object.entries(binDict).map(async ([targetName, linkedPath]) => {
			await binaryHandler.set(
				join("../", name, linkedPath),
				resolve(dependentContext.path, "node_modules/.bin", targetName)
			);
		})
	);
};

const isCoherent = async ({ path, dependentContext, name }, dependencyPackageJson) => {
	const binDict = resolveBinariesDict(path);
	return (
		await Promise.all([
			...Object.keys(dependencyPackageJson.dependencies || {}).map(packageName =>
				isDirectory(resolve(path, "node_modules", packageName))
			),
			...Object.entries(binDict || {}).map(async ([targetName, linkedPath]) => {
				const targetPath = resolve(dependentContext.path, "node_modules/.bin", targetName);
				return binaryHandler.has(join("../", name, linkedPath), targetPath);
			})
		])
	).every(Boolean);
};

module.exports = async dependencyContext => {
	const {
		name,
		path,
		dependentContext,
		externalContext,
		latestSupportedPublishedVersion,
		versionRange
	} = dependencyContext;
	const isInstalled = await isDirectory(path);
	const dependencyPackageJson = isInstalled ? getPackageJson(path) : null;
	if (latestSupportedPublishedVersion && isInstalled) {
		if (
			optionalChaining(dependencyPackageJson, "version") === latestSupportedPublishedVersion
		) {
			// Seems up to date, but let's follow with quick sanity check and confirm whether
			// there are corresponding folders for subdependencies
			if (await isCoherent(dependencyContext, dependencyPackageJson)) return;
			log.notice("%s not coherent %s, reinstalling", dependentContext.name, name);
		}
	}
	const targetVersion = latestSupportedPublishedVersion || versionRange;
	const sourceDirname = await muteErrorIfOptional(dependencyContext, () =>
		cachePackage(name, targetVersion, externalContext)
	);
	if (!sourceDirname) return;
	if (
		!latestSupportedPublishedVersion &&
		isInstalled &&
		dependencyPackageJson &&
		dependencyPackageJson._npmCrossLinkCacheName
	) {
		const cachedDependencyPackageJson = getPackageJson(sourceDirname);
		if (
			cachedDependencyPackageJson &&
			dependencyPackageJson._npmCrossLinkCacheName ===
				cachedDependencyPackageJson._npmCrossLinkCacheName
		) {
			if (await isCoherent(dependencyContext, dependencyPackageJson)) return;
			log.notice("%s not coherent %s, reinstalling", dependentContext.name, name);
		}
	}
	await rm(path, { loose: true, recursive: true, force: true });
	log.notice("%s installing %s @ %s", dependentContext.name, name, targetVersion);

	dependentContext.installationJobs.add(
		`${ isInstalled ? "update" : "install" }-dependency:${ name }`
	);

	log.debug("%s copy dependency from %s to %s", dependentContext.name, sourceDirname, path);
	await copyDir(sourceDirname, path);

	log.debug(
		"%s map binaries %s %s", dependentContext.name, dependencyContext.name,
		dependencyContext.path
	);
	// Ensure to map binaries
	await mapBinaries(dependencyContext);
};
