"use strict";

const { resolve }      = require("path")
    , isSymbolicLink   = require("./is-symbolic-link")
    , getNpmPathPrefix = require("./get-npm-path-prefix");

module.exports = async packageName =>
	isSymbolicLink(resolve(await getNpmPathPrefix(), "lib/node_modules", packageName));
