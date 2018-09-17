"use strict";

const logger  = require("log4").get("dev-package")
    , rm      = require("fs2/rm")
    , symlink = require("fs2/symlink");

module.exports = async (target, path) => {
	await rm(path, { loose: true });
	logger.info("create symlink of %s at %s", target, path);
	await symlink(target, path, { type: "dir", intermediate: true });
};
