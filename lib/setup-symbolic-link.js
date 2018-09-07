"use strict";

const logger  = require("log4").get("setup-own-package")
    , symlink = require("fs2/symlink")
    , rmPath  = require("./rm-path");

module.exports = async (target, path) => {
	await rmPath(path);
	logger.info("create symlink of %s at %s", target, path);
	await symlink(target, path, { type: "dir", intermediate: true });
};
