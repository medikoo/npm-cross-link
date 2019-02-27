"use strict";

const ensureString  = require("es5-ext/object/validate-stringifiable-value")
    , toShortString = require("es5-ext/to-short-string-representation")
    , validate      = require("validate-npm-package-name");

module.exports = packageName => {
	const packageNameString = ensureString(packageName);
	const result = validate(packageNameString);
	if (result.errors) {
		throw new TypeError(`${ toShortString(packageName) } is not a valid package name`);
	}
	return packageNameString;
};
