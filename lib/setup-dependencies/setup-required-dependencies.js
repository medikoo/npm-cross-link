"use strict";

const log               = require("log").get("npm-cross-link")
    , processDependency = require("./process-dependency");

const prodRejectModes = new Set(["dev", "optional"]);
const devRejectModes = new Set(["prod", "optional"]);

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { name, packageJson } = packageContext;
	const { installMode } = inputOptions;
	const { topPackageName } = progressData;
	const prodDependencies = new Set(Object.keys(packageJson.dependencies || {}));
	prodDependencies.delete(name);
	const devDependencies = new Set(Object.keys(packageJson.devDependencies || {}));
	devDependencies.delete(name);
	for (const dependencyName of prodDependencies) devDependencies.delete(dependencyName);
	packageContext.dependencies = new Set([...prodDependencies, ...devDependencies]);
	if (!packageContext.dependencies.size) return;

	if (
		prodDependencies.size &&
		(!topPackageName || topPackageName !== name || !prodRejectModes.has(installMode))
	) {
		log.debug("for %s setup prod dependencies %o", name, prodDependencies);
		for (const dependencyName of prodDependencies) {
			await processDependency(
				packageContext, dependencyName, userConfiguration, inputOptions, progressData
			);
		}
	}

	if (!devDependencies.size) return;
	if (topPackageName && topPackageName !== name) {
		if (!packageJson.peerDependencies || !packageJson.devDependencies) return;
		log.debug("for %s setup peer dependencies", name);
		// Maintaned package:
		// Ensure to install eventual peerDependences listed as devDependencies as
		// they're technically prod dependencies
		for (const [dependencyName, dependencyVersion] of Object.entries(
			packageJson.peerDependencies
		)) {
			if (packageJson.devDependencies[dependencyName] !== dependencyVersion) continue;
			await processDependency(
				packageContext, dependencyName, userConfiguration, inputOptions, progressData
			);
		}
	} else {
		if (devRejectModes.has(installMode)) return;
		log.debug("for %s setup dev dependencies %o", name, devDependencies);
		for (const dependencyName of devDependencies) {
			await processDependency(
				packageContext, dependencyName, userConfiguration, inputOptions, progressData
			);
		}
	}
};
