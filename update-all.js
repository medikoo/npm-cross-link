"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ensureConfiguration = require("./lib/private/ensure-user-configuration")
    , createProgressData  = require("./lib/private/create-progress-data")
    , updateAll           = require("./lib/private/update-all");

module.exports = (configuration, options = {}) => {
	const progressData = createProgressData();
	const promise = updateAll(
		ensureConfiguration(configuration), toPlainObject(options), progressData
	);
	promise.progressData = progressData;
	return promise;
};
