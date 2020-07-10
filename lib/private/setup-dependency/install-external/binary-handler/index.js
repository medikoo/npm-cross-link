"use strict";

if (process.platform !== "win32") {
	const isSymlink = require("fs2/is-symlink")
	    , symlink   = require("fs2/symlink")
	    , rm        = require("fs2/rm");

	module.exports.has = (target, symlinkPath) => isSymlink(symlinkPath, { linkPath: target });
	module.exports.set = async (target, symlinkPath) => {
		await rm(symlinkPath, { loose: true, force: true, recursive: true });
		await symlink(target, symlinkPath, { intermediate: true });
	};
	return;
}

const path      = require("path")
    , readdir   = require("fs2/readdir")
    , readFile  = require("fs2/read-file")
    , lstat     = require("fs2/lstat")
    , rm        = require("fs2/rm")
    , writeFile = require("fs2/write-file")
    , memoizee  = require("memoizee");

const templatesPath = path.resolve(__dirname, "win-templates");

const resolveTemplates = memoizee(
	async () =>
		new Map(
			await Promise.all(
				(await readdir(templatesPath)).map(async templateName => [
					path.extname(templateName),
					String(await readFile(path.resolve(templatesPath, templateName)))
				])
			)
		),
	{ promise: true }
);

module.exports.has = async (target, symlinkPath) =>
	(
		await Promise.all(
			Array.from(await resolveTemplates()).map(async ([ext]) => {
				const stats = await lstat(`${ symlinkPath }${ ext }`);
				return stats && stats.isFile();
			})
		)
	).every(Boolean);

module.exports.set = async (target, symlinkPath) =>
	(
		await Promise.all(
			Array.from(await resolveTemplates()).map(async ([ext, content]) => {
				const binPath = `${ symlinkPath }${ ext }`;
				await rm(binPath, { loose: true, force: true, recursive: true });
				await writeFile(
					binPath,
					content
						.replace(/TARGET_POSIX/gu, target.replace(/\\/gu, "/"))
						.replace(/TARGET_WIN/gu, target),
					{ intermediate: true }
				);
			})
		)
	).every(Boolean);
