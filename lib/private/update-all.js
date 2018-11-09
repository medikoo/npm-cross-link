"use strict";

const { resolve }    = require("path")
    , readdir        = require("fs2/readdir")
    , installPackage = require("./install-package");

module.exports = async (userConfiguration, inputOptions, progressData) => {
	const { packagesPath, packagesMeta } = userConfiguration;
	const { done } = progressData;

	const conditionallyUpdatePackage = name => {
		if (!packagesMeta[name]) return null; // Not recognized as dev package folder
		if (done.has(name)) return null; // Already processed
		return installPackage({ name }, userConfiguration, inputOptions, progressData);
	};
	for (const directoryName of await readdir(packagesPath, { type: { directory: true } })) {
		// Intentionally (to avoid npm race conditions) process packages one by one
		if (directoryName.startsWith("@")) {
			for (const subDirectoryName of await readdir(resolve(packagesPath, directoryName), {
				type: { directory: true }
			})) {
				await conditionallyUpdatePackage(`${ directoryName }/${ subDirectoryName }`);
			}
			continue;
		}
		await conditionallyUpdatePackage(directoryName);
	}
};
