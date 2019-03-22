"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ensureString        = require("es5-ext/object/validate-stringifiable-value")
    , { resolve }         = require("path")
    , NpmCrossLinkError   = require("./lib/npm-cross-link-error")
    , ensureConfiguration = require("./lib/private/ensure-user-configuration")
    , createProgressData  = require("./lib/private/create-progress-data")
    , install             = require("./lib/private/install")
    , getPackageJson      = require("./lib/get-package-json");

module.exports = (path, userConfiguration, inputOptions = {}) => {
	path = resolve(ensureString(path));
	const progressData = createProgressData();
	const packageContext = { path };
	packageContext.packageJson = getPackageJson(path);
	if (!packageContext.packageJson) {
		return Promise.reject(new NpmCrossLinkError(`Could not find package.json at ${ path }`));
	}
	progressData.topPackageName = packageContext.name = packageContext.packageJson.name;
	const promise = install(
		packageContext, ensureConfiguration(userConfiguration), toPlainObject(inputOptions),
		progressData
	);
	promise.progressData = progressData;
	return promise;
};
