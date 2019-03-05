"use strict";

const ensureObject             = require("es5-ext/object/valid-object")
    , toPlainObject            = require("es5-ext/object/normalize-options")
    , ensurePackageName        = require("./lib/ensure-package-name")
    , ensureConfiguration      = require("./lib/private/ensure-user-configuration")
    , createProgressData       = require("./lib/private/create-progress-data")
    , installPackageGlobally   = require("./lib/private/install-package-globally")
    , installMaintainedPackage = require("./lib/private/install-maintained-package");

module.exports = (packageNames, userConfiguration, inputOptions = {}) => {
	packageNames = Array.from(ensureObject(packageNames), ensurePackageName);
	userConfiguration = ensureConfiguration(userConfiguration);
	inputOptions = toPlainObject(inputOptions);
	const progressData = createProgressData();

	const promise = packageNames.reduce(async (previousPromise, name) => {
		await previousPromise;
		progressData.topPackageName = name;
		const isExternal = !userConfiguration.packagesMeta[name];
		const packageContext = { name };
		if (isExternal) {
			return installPackageGlobally(
				packageContext, userConfiguration, inputOptions, progressData
			);
		}
		return installMaintainedPackage(
			packageContext, userConfiguration, inputOptions, progressData
		);
	}, Promise.resolve());
	promise.progressData = progressData;
	return promise;
};
