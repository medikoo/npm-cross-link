"use strict";

const optionalChaining = require("es5-ext/optional-chaining");

module.exports = (dependencyContext, inputOptions) => {
	const { name, dependentContext: { packageJson } } = dependencyContext;
	if (optionalChaining(packageJson.dependencies, name)) return "dependencies";
	if (optionalChaining(packageJson.devDependencies, name)) return "devDependencies";
	if (optionalChaining(packageJson.optionalDependencies, name)) return "optionalDependencies";
	switch (inputOptions.saveMode) {
		case "dev":
			return "devDependencies";
		case "optional":
			return "optionalDependencies";
		default:
			return "dependencies";
	}
};
