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

module.exports = async dependencyContext => {
	const {
		name,
		path,
		dependentContext,
		externalContext,
		latestSupportedPublishedVersion,
		versionRange
	} = dependencyContext;
	const wasInstalled = await isDirectory(path);
	const packageJson = wasInstalled ? getPackageJson(path) : null;
	if (latestSupportedPublishedVersion && wasInstalled) {
		if (optionalChaining(packageJson, "version") === latestSupportedPublishedVersion) {
			// Seems up to date, but let's follow with quick sanity check and confirm whether
			// there are corresponding folders for subdependencies
			const binDict = resolveBinariesDict(path);
			if (
				(
					await Promise.all([
						...Object.keys(packageJson.dependencies || {}).map(packageName =>
							isDirectory(resolve(path, "node_modules", packageName))
						),
						...Object.entries(binDict || {}).map(async ([targetName, linkedPath]) => {
							const targetPath = resolve(
								dependentContext.path, "node_modules/.bin", targetName
							);
							return binaryHandler.has(join("../", name, linkedPath), targetPath);
						})
					])
				).every(Boolean)
			) {
				return;
			}
		}
	}
	const targetVersion = latestSupportedPublishedVersion || versionRange;
	const sourceDirname = await muteErrorIfOptional(dependencyContext, () =>
		prepareDependency(name, targetVersion, externalContext)
	);
	if (!sourceDirname) return;
	if (wasInstalled && packageJson && packageJson._npmCrossLinkCacheName) {
		const cachePackageJson = getPackageJson(sourceDirname);
		if (
			cachePackageJson &&
			packageJson._npmCrossLinkCacheName === cachePackageJson._npmCrossLinkCacheName
		) {
			return;
		}
	}
	await rm(path, { loose: true, recursive: true, force: true });
	log.notice("%s installing %s @ %s", dependentContext.name, name, targetVersion);

	dependentContext.installationJobs.add(
		`${ wasInstalled ? "update" : "install" }-dependency:${ name }`
	);
	await copyDir(sourceDirname, path);

	log.debug("map binaries");
	// Ensure to map binaries
	await mapBinaries(dependencyContext);
};
