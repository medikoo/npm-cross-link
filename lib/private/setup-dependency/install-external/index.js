"use strict";

const optionalChaining    = require("es5-ext/optional-chaining")
    , { join, resolve }   = require("path")
    , copyDir             = require("fs2/copy-dir")
    , isDirectory         = require("fs2/is-directory")
    , rm                  = require("fs2/rm")
    , log                 = require("log").get("npm-cross-link")
    , getPackageJson      = require("../../../get-package-json")
    , muteErrorIfOptional = require("../mute-error-if-optional")
    , prepareDependency   = require("./prepare")
    , resolveBinariesDict = require("./resolve-binaries-dict")
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
	const packageJson = isInstalled ? getPackageJson(path) : null;
	if (latestSupportedPublishedVersion && isInstalled) {
		if (optionalChaining(packageJson, "version") === latestSupportedPublishedVersion) {
			// Seems up to date, but let's follow with quick sanity check and confirm whether
			// there are corresponding folders for subdependencies
			if (await isCoherent(dependencyContext, packageJson)) return;
			log.notice("%s not coherent %s, reinstalling", dependentContext.name, name);
		}
	}
	const targetVersion = latestSupportedPublishedVersion || versionRange;
	const sourceDirname = await muteErrorIfOptional(dependencyContext, () =>
		prepareDependency(name, targetVersion, externalContext)
	);
	if (!sourceDirname) return;
	if (
		!latestSupportedPublishedVersion &&
		isInstalled &&
		packageJson &&
		packageJson._npmCrossLinkCacheName
	) {
		const cachePackageJson = getPackageJson(sourceDirname);
		if (
			cachePackageJson &&
			packageJson._npmCrossLinkCacheName === cachePackageJson._npmCrossLinkCacheName
		) {
			if (await isCoherent(dependencyContext, packageJson)) return;
			log.notice("%s not coherent %s, reinstalling", dependentContext.name, name);
		}
	}
	await rm(path, { loose: true, recursive: true, force: true });
	log.notice("%s installing %s @ %s", dependentContext.name, name, targetVersion);

	dependentContext.installationJobs.add(
		`${ isInstalled ? "update" : "install" }-dependency:${ name }`
	);
	await copyDir(sourceDirname, path);

	log.debug("map binaries");
	// Ensure to map binaries
	await mapBinaries(dependencyContext);
};
