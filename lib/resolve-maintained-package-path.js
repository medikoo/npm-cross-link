"use strict";

const { resolve } = require("path");

module.exports = (name, { packagesMeta, packagesPath, multiPackageReposMeta }) => {
	const { multiPackageRepoName, path } = packagesMeta[name];
	if (multiPackageRepoName) {
		return resolve(multiPackageReposMeta[multiPackageRepoName].path, path);
	}
	if (path) return path;
	return resolve(packagesPath, name);
};
