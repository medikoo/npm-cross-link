"use strict";

const memoizee            = require("memoizee")
    , { join, resolve }   = require("path")
    , copyDir             = require("fs2/copy-dir")
    , mkdir               = require("fs2/mkdir")
    , symlink             = require("fs2/symlink")
    , rm                  = require("fs2/rm")
    , got                 = require("got")
    , tar                 = require("tar")
    , tmpdir              = require("os").tmpdir()
    , log                 = require("log4").get("npm-cross-link")
    , runProgram          = require("../../../../run-program")
    , getPackageJson      = require("../../../get-package-json")
    , muteErrorIfOptional = require("./mute-error-if-optional");

const prepareDependency = memoizee(
	async (name, version, metadata) => {
		const targetDirname = resolve(tmpdir, "npm-cross-link", name, version);
		log.notice("preparing install of %s", `${ name }@${ version }`);
		await rm(targetDirname, { loose: true, recursive: true, force: true });
		await mkdir(targetDirname, { intermediate: true });
		await new Promise((promiseResolve, promiseReject) => {
			const stream = got
				.stream(metadata.versions[version].dist.tarball)
				.pipe(tar.x({ cwd: targetDirname, strip: 1 }));
			stream.on("error", promiseReject);
			stream.on("end", promiseResolve);
		});
		await runProgram("npm", ["install", "--production"], {
			cwd: targetDirname,
			logger: log.levelRoot.get("npm:install")
		});
		await rm(resolve(targetDirname, "package-lock.json"), {
			loose: true,
			recursive: true,
			force: true
		});
		return targetDirname;
	},
	{ promise: true, length: 2 }
);

module.exports = async dependencyContext => {
	const {
		name,
		path,
		dependentContext,
		externalContext: { metadata },
		latestSupportedVersion,
		versionRange
	} = dependencyContext;
	const targetVersion = latestSupportedVersion || versionRange;
	log.notice("%s updating %s to %s", dependentContext.name, name, targetVersion);
	await rm(path, { loose: true, recursive: true, force: true });
	const sourceDirname = await muteErrorIfOptional(dependencyContext, () =>
		prepareDependency(name, targetVersion, metadata)
	);
	if (!sourceDirname) return;
	await copyDir(sourceDirname, path);

	// Ensure to map binaries
	await Promise.all(
		Object.entries(getPackageJson(path).bin || {}).map(async ([targetName, linkedPath]) => {
			const targetPath = resolve(dependentContext.path, "node_modules/.bin", targetName);
			await rm(targetPath, { loose: true, force: true, recursive: true });
			await symlink(join("../", name, linkedPath), targetPath, { intermediate: true });
		})
	);
};
