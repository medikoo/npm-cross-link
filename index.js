"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ensureString        = require("es5-ext/object/validate-stringifiable-value")
    , ensureConfiguration = require("./lib/ensure-configuration")
    , installPackage      = require("./lib/install-package");

module.exports = (packageName, configuration, options = {}) =>
	installPackage(
		ensureString(packageName), ensureConfiguration(configuration), toPlainObject(options)
	);
