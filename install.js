"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ensureString        = require("es5-ext/object/validate-stringifiable-value")
    , { resolve }         = require("path")
    , ensureConfiguration = require("./lib/private/ensure-user-configuration")
    , createProgressData  = require("./lib/private/create-progress-data")
    , install             = require("./lib/private/install");

module.exports = (path, configuration, options = {}) => {
	path = resolve(ensureString(path));
	const progressData = createProgressData();
	const promise = install(
		{ path }, ensureConfiguration(configuration), toPlainObject(options), progressData
	);
	promise.progressData = progressData;
	return promise;
};
