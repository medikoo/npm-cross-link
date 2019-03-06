"use strict";

const { resolve } = require("path")
    , readFile    = require("fs2/read-file")
    , writeFile   = require("fs2/write-file");

const resolveIndentationString = async packageJsonPath => {
	const packageJsonString = await readFile(packageJsonPath, { loose: true, encoding: "utf8" });
	if (packageJsonString) {
		const match = packageJsonString.match(/\n(\s+)[^\s]/u);
		if (match) return match[1];
	}
	return "  ";
};

module.exports = async (path, packageJson) => {
	const packageJsonPath = resolve(path, "package.json");
	return writeFile(
		packageJsonPath,
		`${ JSON.stringify(packageJson, null, await resolveIndentationString(packageJsonPath)) }\n`
	);
};
