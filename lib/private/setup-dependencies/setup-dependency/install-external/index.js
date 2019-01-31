"use strict";

const optionalChaining    = require("es5-ext/optional-chaining")
    , { join, resolve }   = require("path")
    , copyDir             = require("fs2/copy-dir")
    , isDirectory         = require("fs2/is-directory")
    , symlink             = require("fs2/symlink")
    , rm                  = require("fs2/rm")
    , log                 = require("log").get("npm-cross-link")
    , getPackageJson      = require("../../../get-package-json")
    , muteErrorIfOptional = require("../mute-error-if-optional")
    , prepareDependency   = require("./prepare");

module.exports = async dependencyContext => {
	const {
		name,
		path,
		dependentContext,
		externalContext: { metadata },
		latestSupportedPublishedVersion,
		versionRange
	} = dependencyContext;
	if (latestSupportedPublishedVersion) {
		if (
			(await isDirectory(path)) &&
			optionalChaining(getPackageJson(path), "version") === latestSupportedPublishedVersion
		) {
			// Up to date
			return;
		}
	}
	const targetVersion = latestSupportedPublishedVersion || versionRange;
	log.notice("%s installing %s v%s", dependentContext.name, name, targetVersion);
	await rm(path, { loose: true, recursive: true, force: true });
	const sourceDirname = await muteErrorIfOptional(dependencyContext, () =>
		prepareDependency(name, targetVersion, metadata)
	);
	if (!sourceDirname) return;

	dependentContext.installationJobs.add(`install-dependency:${ name }`);
	await copyDir(sourceDirname, path);

	// Ensure to map binaries
	await Promise.all(
		Object.entries(getPackageJson(path).bin || {}).map(async ([targetName, linkedPath]) => {
			const targetPath = resolve(dependentContext.path, "node_modules/.bin", targetName);
			await rm(targetPath, { loose: true, force: true, recursive: true });
			await symlink(join("../", name, linkedPath), targetPath, {
				type: "junction",
				intermediate: true
			});
		})
	);
};
