"use strict";

const { resolve }           = require("path")
    , { homedir }           = require("os")
    , isModuleNotFoundError = require("ncjsm/is-module-not-found-error")
    , NpmCrossLinkError     = require("./npm-cross-link-error");

const configurationPath = resolve(homedir(), ".npm-cross-link");

const resolveConfigurationModule = () => {
	try {
		return require(configurationPath);
	} catch (error) {
		if (isModuleNotFoundError(error, configurationPath)) {
			throw new NpmCrossLinkError("Configuration not provided at ~/.npm-cross-link");
		}
		throw error;
	}
};

module.exports = () =>
	new Promise(promiseResolve => { promiseResolve(resolveConfigurationModule()); });
