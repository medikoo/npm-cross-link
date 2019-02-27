"use strict";

const toPlainObject            = require("es5-ext/object/normalize-options")
    , ensurePackageName        = require("./lib/ensure-package-name")
    , ensureConfiguration      = require("./lib/private/ensure-user-configuration")
    , createProgressData       = require("./lib/private/create-progress-data")
    , installMaintainedPackage = require("./lib/private/install-maintained-package");

module.exports = (name, configuration, options = {}) => {
	name = ensurePackageName(name);
	const progressData = createProgressData();
	progressData.topPackageName = name;
	const promise = installMaintainedPackage(
		{ name }, ensureConfiguration(configuration), toPlainObject(options), progressData
	);
	promise.progressData = progressData;
	return promise;
};
