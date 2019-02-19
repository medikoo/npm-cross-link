"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ensureString        = require("es5-ext/object/validate-stringifiable-value")
    , ensureConfiguration = require("./lib/private/ensure-user-configuration")
    , createProgressData  = require("./lib/private/create-progress-data")
    , installPackage      = require("./lib/private/install-package");

module.exports = (name, configuration, options = {}) => {
	name = ensureString(name);
	const progressData = createProgressData();
	progressData.topPackageName = name;
	const promise = installPackage(
		{ name }, ensureConfiguration(configuration), toPlainObject(options), progressData
	);
	promise.progressData = progressData;
	return promise;
};
