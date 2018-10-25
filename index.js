"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ensureString        = require("es5-ext/object/validate-stringifiable-value")
    , ensureConfiguration = require("./lib/ensure-configuration")
    , installPackage      = require("./lib/install-package");

module.exports = (name, configuration, options = {}) =>
	installPackage(
		{ name: ensureString(name) }, ensureConfiguration(configuration), toPlainObject(options)
	);
