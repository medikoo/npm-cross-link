"use strict";

const { resolve, sep } = require("path")
    , { homedir }      = require("os")
    , readFile         = require("fs2/read-file")
    , writeFile        = require("fs2/write-file");

const cachePath = resolve(homedir(), ".npm-cross-link-cache")
    , resolvePath = name => name.replace(/\//gu, sep);

module.exports = {
	get(name) {
		const path = resolvePath(name);
		return readFile(resolve(cachePath, path), { loose: true });
	},
	set(name, value) {
		const path = resolvePath(name);
		return writeFile(resolve(cachePath, path), value, { intermediate: true });
	},
	path: cachePath,
};
