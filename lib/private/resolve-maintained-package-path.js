"use strict";

const path = require("path");

module.exports = (name, { packagesMeta, packagesPath }) =>
	packagesMeta[name].path || path.resolve(packagesPath, name);
