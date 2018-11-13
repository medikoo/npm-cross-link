"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ee                  = require("event-emitter")
    , unifyEmitters       = require("event-emitter/unify")
    , ensureConfiguration = require("./lib/private/ensure-user-configuration")
    , createProgressData  = require("./lib/private/create-progress-data")
    , updateAll           = require("./lib/private/update-all");

module.exports = (configuration, options = {}) => {
	const progressData = createProgressData();
	const promise = ee(
		updateAll(ensureConfiguration(configuration), toPlainObject(options), progressData)
	);
	unifyEmitters(progressData, promise);
	return promise;
};
