"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ensureObject        = require("es5-ext/object/valid-object")
    , ensureString        = require("es5-ext/object/validate-stringifiable-value")
    , { resolve }         = require("path")
    , ensurePackageName   = require("./lib/ensure-package-name")
    , NpmCrossLinkError   = require("./lib/npm-cross-link-error")
    , ensureConfiguration = require("./lib/private/ensure-user-configuration")
    , createProgressData  = require("./lib/private/create-progress-data")
    , installDependencies = require("./lib/private/install-dependencies")
    , getPackageJson      = require("./lib/private/get-package-json");

module.exports = (path, dependencyNames, userConfiguration, inputOptions = {}) => {
	path = resolve(ensureString(path));
	const dependenciesData = Array.from(ensureObject(dependencyNames), dependencyName => {
		dependencyName = ensureString(dependencyName);
		if (dependencyName.slice(1).includes("@")) {
			return {
				name: ensurePackageName(dependencyName.slice(0, dependencyName.lastIndexOf("@"))),
				versionRange: dependencyName.slice(dependencyName.lastIndexOf("@") + 1)
			};
		}
		return { name: ensurePackageName(dependencyName) };
	});
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
