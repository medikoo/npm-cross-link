"use strict";

const toPlainObject          = require("es5-ext/object/normalize-options")
    , ensureConfiguration    = require("./lib/ensure-user-configuration")
    , createProgressData     = require("./lib/create-progress-data")
    , installPackageGlobally = require("./lib/install-package-globally")
    , tokenizePackageSpecs   = require("./lib/utils/tokenize-package-specs");

module.exports = (packageNames, userConfiguration, inputOptions = {}) => {
	const packageSpecsData = tokenizePackageSpecs(packageNames);
	userConfiguration = ensureConfiguration(userConfiguration);
	inputOptions = toPlainObject(inputOptions);
	const progressData = createProgressData();

	const promise = packageSpecsData.reduce(async (previousPromise, packageContext) => {
		await previousPromise;
		progressData.topPackageName = packageContext.name;
		return installPackageGlobally(
			packageContext, userConfiguration, inputOptions, progressData
		);
	}, Promise.resolve());
	promise.progressData = progressData;
	return promise;
};
