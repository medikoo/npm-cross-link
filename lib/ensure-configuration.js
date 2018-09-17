"use strict";

const ensureObject        = require("es5-ext/object/valid-object")
    , ensurePlainFunction = require("es5-ext/object/ensure-plain-function")
    , ensureString        = require("es5-ext/object/validate-stringifiable-value")
    , { resolve }         = require("path")
    , { homedir }         = require("os")
    , log                 = require("log4").get("dev-package:configuration").info;

module.exports = userConfiguration => {
	log.debug("user configuration: %O", userConfiguration);

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
		log.get("package-meta")("recognize %s at %s", packageName, packageMeta.repoUrl);
	}

	const hooks = (configuration.hooks = {});
	if (!userConfiguration.hooks) return configuration;
	const userHooks = ensureObject(userConfiguration.hooks);
	if (userHooks.afterPackageInstall) {
		hooks.afterPackageInstall = ensurePlainFunction(userHooks.afterPackageInstall);
		log.get("hooks")("recognize %s", "afterPackageInstall");
	}
	return configuration;
};
