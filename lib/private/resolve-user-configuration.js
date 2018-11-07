"use strict";

const { resolve }           = require("path")
    , { homedir }           = require("os")
    , isModuleNotFoundError = require("cjs-module/is-module-not-found-error")
    , DevPackageError       = require("../dev-package-error");

const configurationPath = resolve(homedir(), ".dev-package");

const resolveConfigurationModule = () => {
	try {
		return require(configurationPath);
	} catch (error) {
		if (isModuleNotFoundError(error, configurationPath)) {
			throw new DevPackageError("Configuration not provided at ~/.dev-package");
		}
		throw error;
	}
};

module.exports = () => new Promise(promiseResolve => promiseResolve(resolveConfigurationModule()));
