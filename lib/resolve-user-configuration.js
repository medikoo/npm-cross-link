"use strict";

const { resolve }            = require("path")
    , { homedir }            = require("os")
    , isModuleNotFoundError  = require("cjs-module/is-module-not-found-error")
    , DevPackageInstallError = require("./dev-package-install-error")
    , ensureConfiguration    = require("./ensure-configuration");

const configurationPath = resolve(homedir(), ".dev-package-install");

const resolveConfigurationModule = () => {
	try {
		return require(configurationPath);
	} catch (error) {
		if (isModuleNotFoundError(error, configurationPath)) {
			throw new DevPackageInstallError(
				"Configuration not provided at ~/.dev-package-install"
			);
		}
		throw error;
	}
};

module.exports = async () => ensureConfiguration(await resolveConfigurationModule());
