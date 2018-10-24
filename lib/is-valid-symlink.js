"use strict";

const { dirname, resolve } = require("path")
    , readlink             = require("fs2/readlink");

module.exports = async (linkPath, targetPath) => {
	const realLinkedPath = await readlink(linkPath, { loose: true });
	if (!realLinkedPath) return false;
	return resolve(dirname(linkPath), realLinkedPath) === targetPath;
};
