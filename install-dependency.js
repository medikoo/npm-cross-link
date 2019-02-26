"use strict";

const toPlainObject            = require("es5-ext/object/normalize-options")
    , ensureString             = require("es5-ext/object/validate-stringifiable-value")
    , { resolve }              = require("path")
    , NpmCrossLinkError        = require("./lib/npm-cross-link-error")
    , ensureConfiguration      = require("./lib/private/ensure-user-configuration")
    , createProgressData       = require("./lib/private/create-progress-data")
    , installDependency        = require("./lib/private/install-dependency")
    , getPackageJson           = require("./lib/private/get-package-json")
    , resolveDependencyContext = require("./lib/private/resolve-dependency-context");

module.exports = (path, dependencyName, userConfiguration, options = {}) => {
	path = resolve(ensureString(path));
	dependencyName = ensureString(dependencyName);
	const progressData = createProgressData();
	const packageContext = { path };
	packageContext.packageJson = getPackageJson(path);
	if (!packageContext.packageJson) {
		return Promise.reject(new NpmCrossLinkError(`Could not find a package.json at ${ path }`));
	}
	progressData.topPackageName = packageContext.name = packageContext.packageJson.name || "<main>";
	userConfiguration = ensureConfiguration(userConfiguration);
	const promise = installDependency(
		resolveDependencyContext(packageContext, dependencyName, userConfiguration),
		userConfiguration, toPlainObject(options), progressData
	);
	promise.progressData = progressData;
	return promise;
};
