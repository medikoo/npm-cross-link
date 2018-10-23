"use strict";

const { resolve }       = require("path")
    , isSymbolicLink    = require("./is-symbolic-link")
    , getNpmModulesPath = require("./get-npm-modules-path");

module.exports = async packageName =>
	isSymbolicLink(resolve(await getNpmModulesPath(), packageName));
