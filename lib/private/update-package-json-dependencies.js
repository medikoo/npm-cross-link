"use strict";

const optionalChaining  = require("es5-ext/optional-chaining")
    , semver            = require("semver")
    , updatePackageJson = require("./update-package-json");

const isUpdatableVersionRange = RegExp.prototype.test.bind(/^\^\d+(?:\.\d+(?:\.\d+)?)?$/u);

const updateSection = (section, handled, dependenciesContext) => {
	const resultMap = new Map();
	for (const [name, versionRange] of Object.entries(section)) {
		if (handled.has(name)) continue;
		handled.add(name);
		const dependencyContext = dependenciesContext.get(name);
		if (!dependencyContext) continue;
		if (isUpdatableVersionRange(versionRange)) {
			if (dependencyContext.latestSupportedPublishedVersion) {
				resultMap.set(name, `^${ dependencyContext.latestSupportedPublishedVersion }`);
				continue;
			}
			const localVersion = optionalChaining(dependencyContext.localContext, "localVersion");
			if (localVersion && semver.gt(localVersion, semver.coerce(versionRange.slice(1)))) {
				resultMap.set(name, `^${ localVersion }`);
				continue;
			}
		}
		resultMap.set(name, versionRange);
	}
	const result = {};
	for (const [name, versionRange] of Array.from(resultMap).sort(([name1], [name2]) =>
		name1.localeCompare(name2)
	)) {
		result[name] = versionRange;
	}
	return result;
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
