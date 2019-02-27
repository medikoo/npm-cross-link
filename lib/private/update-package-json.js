"use strict";

const { resolve } = require("path")
    , readFile    = require("fs2/read-file")
    , writeFile   = require("fs2/write-file");

const resolveIndentationString = async packageJsonPath => {
	const match = String(await readFile(packageJsonPath)).match(/^(\s+)[^\s]/u);
	return (match && match[1]) || "  ";
};

module.exports = async (path, packageJson) => {
	const packageJsonPath = resolve(path, "package.json");
	return writeFile(
		packageJsonPath,
		`${ JSON.stringify(packageJson, null, await resolveIndentationString(packageJsonPath)) }\n`
	);
};
