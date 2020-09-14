"use strict";

const ensureArray         = require("es5-ext/array/valid-array")
    , isValue             = require("es5-ext/object/is-value")
    , ensureObject        = require("es5-ext/object/valid-object")
    , ensurePlainFunction = require("es5-ext/object/ensure-plain-function")
    , ensureString        = require("type/string/ensure")
    , { resolve }         = require("path")
    , { homedir }         = require("os")
    , log                 = require("log").get("npm-cross-link:configuration").debug;

module.exports = userConfiguration => {
	log.debug("user input: %O", userConfiguration);

	const configuration = {};

	configuration.packagesPath = userConfiguration.packagesPath
		? resolve(ensureString(userConfiguration.packagesPath))
		: resolve(homedir(), "npm-packages");
	log("packages path: %s", configuration.packagesPath);

	ensureObject(userConfiguration.packagesMeta);
	const packagesMeta = (configuration.packagesMeta = Object.create(null));
	for (const [packageName, userPackageMeta] of Object.entries(userConfiguration.packagesMeta)) {
		ensureObject(userPackageMeta);
		const packageMeta = (packagesMeta[packageName] = {});
		packageMeta.repoUrl = ensureString(userPackageMeta.repoUrl);
		packageMeta.path = ensureString(userPackageMeta.path, { isOptional: true });
		log.get("package-meta")("recognize %s at %s", packageName, packageMeta.repoUrl);
	}

	const hooks = (configuration.hooks = {});
	if (userConfiguration.hooks) {
		const userHooks = ensureObject(userConfiguration.hooks);
		if (userHooks.afterPackageInstall) {
			hooks.afterPackageInstall = ensurePlainFunction(userHooks.afterPackageInstall);
			log.get("hooks")("recognize %s", "afterPackageInstall");
		}
	}

	if (isValue(userConfiguration.userDependencies)) {
		configuration.userDependencies = ensureArray(
			userConfiguration.userDependencies
		).map(packageName => ensureString(packageName));
	} else {
		configuration.userDependencies = [];
	}

	if (isValue(userConfiguration.toBeCopiedDependencies)) {
		configuration.toBeCopiedDependencies = new Set(
			Array.from(userConfiguration.toBeCopiedDependencies, packageName =>
				ensureString(packageName)
			)
		);
	} else {
		configuration.toBeCopiedDependencies = new Set();
	}
	return configuration;
};
