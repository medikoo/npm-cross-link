"use strict";

const updatePackageJson          = require("./update-package-json")
    , resolveUpdatedVersionRange = require("./resolve-updated-version-range")
    , entriesToOrderedKeysObject = require("./entries-to-ordered-keys-object");

const updateSection = (section, handled, dependenciesContext) => {
	const resultMap = new Map();
	for (const [name, versionRange] of Object.entries(section)) {
		if (handled.has(name)) continue;
		handled.add(name);
		const dependencyContext = dependenciesContext.get(name);
		if (!dependencyContext) continue;
		resultMap.set(name, resolveUpdatedVersionRange(dependencyContext) || versionRange);
	}
	return entriesToOrderedKeysObject(resultMap);
};

module.exports = packageContext => {
	const { path, packageJson, dependenciesContext } = packageContext, handled = new Set();
	if (packageJson.dependencies) {
		packageJson.dependencies = updateSection(
			packageJson.dependencies, handled, dependenciesContext
		);
	}
	if (packageJson.devDependencies) {
		packageJson.devDependencies = updateSection(
			packageJson.devDependencies, handled, dependenciesContext
		);
	}
	if (packageJson.optionalDependencies) {
		packageJson.optionalDependencies = updateSection(
			packageJson.optionalDependencies, handled, dependenciesContext
		);
	}
	return updatePackageJson(path, packageJson);
};
