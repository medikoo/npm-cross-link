"use strict";

const optionalChaining                     = require("es5-ext/optional-chaining")
    , { join, resolve, relative, dirname } = require("path")
    , copyDir                              = require("fs2/copy-dir")
    , isDirectory                          = require("fs2/is-directory")
    , isSymlink                            = require("fs2/is-symlink")
    , symlink                              = require("fs2/symlink")
    , rm                                   = require("fs2/rm")
    , lstat                                = require("fs2/lstat")
    , log                                  = require("log").get("npm-cross-link")
    , getPackageJson                       = require("../../get-package-json")
    , muteErrorIfOptional                  = require("../mute-error-if-optional")
    , cachePackage                         = require("../../cache-package")
    , resolveBinariesDict                  = require("../../resolve-package-binaries-dict")
    , resolveExternalContext               = require("../../resolve-external-context")
    , binaryHandler                        = require("./binary-handler")
    , isCoherent                           = require("./is-coherent")
    , resolveIsToBeLinked                  = require("./resolve-is-to-be-linked");

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

module.exports = async (dependencyContext, userConfiguration, progressData) => {
	const externalContext = await resolveExternalContext(dependencyContext, progressData);

	const { name, path, dependentContext, latestSupportedPublishedVersion, versionRange } =
		dependencyContext;

	const targetVersion = latestSupportedPublishedVersion || versionRange;
	const sourceDirname = await muteErrorIfOptional(dependencyContext, () =>
		cachePackage(name, targetVersion, externalContext)
	);
	if (!sourceDirname) return;
	const isToBeLinked = await resolveIsToBeLinked(
		dependencyContext, userConfiguration, progressData
	);

	if (isToBeLinked) {
		const linkedPath = relative(dirname(path), sourceDirname);
		if (!(await isSymlink(path, { linkPath: linkedPath }))) {
			const isInstalled = await lstat(path, { loose: true });
			if (isInstalled) await rm(path, { loose: true, recursive: true, force: true });
			log.notice("%s linking %s @ %s", dependentContext.name, name, targetVersion);
			await symlink(linkedPath, path, { intermediate: true });
			dependentContext.installationJobs.add(
				`${ isInstalled ? "update" : "install" }-dependency:${ name }`
			);
		}
		if (await isCoherent(dependencyContext, getPackageJson(path))) return;
		log.notice("%s not coherent %s, relinking binaries", dependentContext.name, name);
	} else {
		const isInstalled = await isDirectory(path);
		const dependencyPackageJson = isInstalled ? getPackageJson(path) : null;
		if (latestSupportedPublishedVersion && isInstalled) {
			if (
				optionalChaining(dependencyPackageJson, "version") ===
				latestSupportedPublishedVersion
			) {
				// Seems up to date, but let's follow with quick sanity check and confirm whether
				// there are corresponding folders for subdependencies
				if (await isCoherent(dependencyContext, dependencyPackageJson)) return;
				log.notice("%s not coherent %s, reinstalling", dependentContext.name, name);
			}
		}

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
	}

	log.debug(
		"%s map binaries %s %s", dependentContext.name, dependencyContext.name,
		dependencyContext.path
	);
	// Ensure to map binaries
	await mapBinaries(dependencyContext);
};
