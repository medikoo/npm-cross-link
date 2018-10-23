"use strict";

const { resolve } = require("path")
    , rmdir       = require("fs2/rmdir");

module.exports = packagePath =>
	rmdir(resolve(packagePath, "node_modules/.staging"), {
		loose: true,
		recursive: true,
		force: true
	});
