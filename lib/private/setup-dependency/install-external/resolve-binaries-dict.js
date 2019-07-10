"use strict";

const getPackageJson = require("../../../get-package-json");

module.exports = path => {
	const packageJson = getPackageJson(path);
	if (!packageJson.bin) return null;
	return typeof packageJson.bin === "string"
		? { [packageJson.name]: packageJson.bin }
		: packageJson.bin;
};
