"use strict";

const ensureArray         = require("es5-ext/array/valid-array")
    , isValue             = require("es5-ext/object/is-value")
    , ensurePlainObject   = require("type/plain-object/ensure")
    , ensurePlainFunction = require("es5-ext/object/ensure-plain-function")
    , ensureString        = require("type/string/ensure")
    , { resolve }         = require("path")
    , { homedir }         = require("os")
    , log                 = require("log").get("npm-cross-link:configuration").debug
    , NpmCrossLinkError   = require("../npm-cross-link-error");

module.exports = userConfiguration => {
	log.debug("user input: %O", userConfiguration);

	const configuration = {};

	configuration.packagesPath = userConfiguration.packagesPath
		? resolve(ensureString(userConfiguration.packagesPath))
		: resolve(homedir(), "npm-packages");
	log("packages path: %s", configuration.packagesPath);

	const multiPackageReposMeta = (configuration.multiPackageReposMeta = Object.create(null));
	for (const [multiPackageRepoName, userMultiPackageRepoMeta] of Object.entries(
		ensurePlainObject(userConfiguration.multiPackageReposMeta, { default: {} })
	)) {
		ensurePlainObject(userMultiPackageRepoMeta);
		const multiPackageRepoMeta = (multiPackageReposMeta[multiPackageRepoName] = {});
		multiPackageRepoMeta.repoUrl = ensureString(userMultiPackageRepoMeta.repoUrl);
		multiPackageRepoMeta.path = ensureString(userMultiPackageRepoMeta.path);
	}

	ensurePlainObject(userConfiguration.packagesMeta);
	const packagesMeta = (configuration.packagesMeta = Object.create(null));
	for (const [packageName, userPackageMeta] of Object.entries(userConfiguration.packagesMeta)) {
		ensurePlainObject(userPackageMeta);
		const packageMeta = (packagesMeta[packageName] = {});
		if (userPackageMeta.multiPackageRepoName) {
			packageMeta.multiPackageRepoName = ensureString(userPackageMeta.multiPackageRepoName);
			if (!multiPackageReposMeta[packageMeta.multiPackageRepoName]) {
				throw new NpmCrossLinkError(
					`Invalid configuration, package ${
						packageName
					} refers to not setup multi package repo ${ packageMeta.multiPackageRepoName }`
				);
			}
			packageMeta.path = ensureString(userPackageMeta.path);
		} else {
			packageMeta.repoUrl = ensureString(userPackageMeta.repoUrl);
			packageMeta.path = ensureString(userPackageMeta.path, { isOptional: true });
		}
		log.get("package-meta")("recognize %s at %s", packageName, packageMeta.repoUrl);
	}

	const hooks = (configuration.hooks = {});
	if (userConfiguration.hooks) {
		const userHooks = ensurePlainObject(userConfiguration.hooks);
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
