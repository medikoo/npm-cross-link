"use strict";

const { resolve } = require("path")
    , rmdir       = require("fs2/rmdir");

module.exports = ({ path }) =>
	rmdir(resolve(path, "node_modules/.staging"), { loose: true, recursive: true, force: true });
