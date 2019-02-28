"use strict";

const toPlainObject          = require("es5-ext/object/normalize-options")
    , ensurePackageName      = require("./lib/ensure-package-name")
    , ensureConfiguration    = require("./lib/private/ensure-user-configuration")
    , createProgressData     = require("./lib/private/create-progress-data")
    , installPackageGlobally = require("./lib/private/install-package-globally");

module.exports = (name, userConfiguration, inputOptions = {}) => {
	name = ensurePackageName(name);
	const progressData = createProgressData();
	progressData.topPackageName = name;
	const promise = installPackageGlobally(
		{ name }, ensureConfiguration(userConfiguration), toPlainObject(inputOptions), progressData
	);
	promise.progressData = progressData;
	return promise;
};