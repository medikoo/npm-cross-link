"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ensureConfiguration = require("./lib/ensure-user-configuration")
    , createProgressData  = require("./lib/create-progress-data")
    , updateAll           = require("./lib/update-all");

module.exports = (configuration, options = {}) => {
	const progressData = createProgressData();
	const promise = updateAll(
		ensureConfiguration(configuration), toPlainObject(options), progressData
	);
	promise.progressData = progressData;
	return promise;
};
