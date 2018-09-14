"use strict";

const ensureString        = require("es5-ext/object/validate-stringifiable-value")
    , ensureConfiguration = require("./lib/ensure-configuration")
    , installPackage      = require("./lib/install-package");

module.exports = (packageName, configuration) =>
	installPackage(ensureString(packageName), ensureConfiguration(configuration));
