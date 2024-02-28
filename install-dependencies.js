"use strict";

const toPlainObject        = require("es5-ext/object/normalize-options")
    , ensureString         = require("es5-ext/object/validate-stringifiable-value")
    , { resolve }          = require("path")
    , NpmCrossLinkError    = require("./lib/npm-cross-link-error")
    , ensureConfiguration  = require("./lib/ensure-user-configuration")
    , createProgressData   = require("./lib/create-progress-data")
    , installDependencies  = require("./lib/install-dependencies")
    , getPackageJson       = require("./lib/get-package-json")
    , tokenizePackageSpecs = require("./lib/utils/tokenize-package-specs");

module.exports = (path, dependencyNames, userConfiguration, inputOptions = {}) => {
	path = resolve(ensureString(path));
	const dependenciesData = tokenizePackageSpecs(dependencyNames);
	const progressData = createProgressData();
	const dependentContext = { path };
	dependentContext.packageJson = getPackageJson(path);
	if (!dependentContext.packageJson) {
		return Promise.reject(new NpmCrossLinkError(`Could not find a package.json at ${ path }`));
	}
	progressData.topPackageName = dependentContext.name =
		dependentContext.packageJson.name || "<main>";
	userConfiguration = ensureConfiguration(userConfiguration);
	const promise = installDependencies(
		dependentContext, dependenciesData, userConfiguration, toPlainObject(inputOptions),
		progressData
	);
	promise.progressData = progressData;
	return promise;
};
