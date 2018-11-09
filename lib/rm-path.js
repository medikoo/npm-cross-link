"use strict";

const rmdir       = require("fs2/rmdir")
    , unlink      = require("fs2/unlink")
    , logger      = require("log4").get("setup-own-package")
    , isDirectory = require("./is-directory");

module.exports = async path => {
	const isDir = await isDirectory(path);
	if (isDir) {
		logger.notice("remove directory %s", path);
		return rmdir(path, { recursive: true, force: true });
	}
	if (isDir === false) {
		logger.notice("remove file %s", path);
		return unlink(path);
	}
	return null;
};
