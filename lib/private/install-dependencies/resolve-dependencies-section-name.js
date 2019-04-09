"use strict";

const optionalChaining = require("es5-ext/optional-chaining");

module.exports = (dependencyContext, inputOptions) => {
	const { name, dependentContext: { packageJson } } = dependencyContext;
	const currentSectionName = (() => {
		if (optionalChaining(packageJson.dependencies, name)) return "dependencies";
		if (optionalChaining(packageJson.devDependencies, name)) return "devDependencies";
		if (optionalChaining(packageJson.optionalDependencies, name)) {
			return "optionalDependencies";
		}
		return null;
	})();
	dependencyContext.currentPackageJsonSectionName = currentSectionName;

	const targetSectionName = (() => {
		switch (inputOptions.saveMode) {
			case "dev":
				return "devDependencies";
			case "optional":
				return "optionalDependencies";
			case "prod":
				return "dependencies";
			default:
				return currentSectionName || "dependencies";
		}
	})();
	dependencyContext.targetPackageJsonSectionName = targetSectionName;

	return dependencyContext;
};
