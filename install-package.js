"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ensureString        = require("es5-ext/object/validate-stringifiable-value")
    , ee                  = require("event-emitter")
    , unifyEmitters       = require("event-emitter/unify")
    , ensureConfiguration = require("./lib/private/ensure-user-configuration")
    , createProgressData  = require("./lib/private/create-progress-data")
    , installPackage      = require("./lib/private/install-package");

module.exports = (name, configuration, options = {}) => {
	const progressData = createProgressData();
	const promise = ee(
		installPackage(
			{ name: ensureString(name) }, ensureConfiguration(configuration),
			toPlainObject(options), progressData
		)
	);
	unifyEmitters(progressData, promise);
	return promise;
};
