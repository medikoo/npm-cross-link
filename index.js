"use strict";

const { resolve }  = require("path")
    , setupPackage = require("./lib/setup-package");

module.exports = (packagesPath, packageName) => setupPackage(resolve(packagesPath), packageName);
