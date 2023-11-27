"use strict";

const memoizee       = require("memoizee")
    , getPackageJson = require("../../get-package-json");

module.exports = memoizee(
	path => {
		const packageJson = getPackageJson(path);
		if (!packageJson.bin) return null;
		return typeof packageJson.bin === "string"
			? { [packageJson.name]: packageJson.bin }
			: packageJson.bin;
	},
	{ primitive: true }
);
