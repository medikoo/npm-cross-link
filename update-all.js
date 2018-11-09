"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ee                  = require("event-emitter")
    , unifyEmitters       = require("event-emitter/unify")
    , ensureConfiguration = require("./lib/private/ensure-user-configuration")
    , updateAll           = require("./lib/private/update-all");

module.exports = (configuration, options = {}) => {
	const progressData = ee({ done: new Set(), ongoingMap: new Map(), externalsMap: new Map() });
	const promise = ee(
		updateAll(ensureConfiguration(configuration), toPlainObject(options), progressData)
	);
	unifyEmitters(progressData, promise);
	return promise;
};
