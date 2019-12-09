"use strict";

const log               = require("log").get("npm-cross-link")
    , getPackageJson    = require("../../get-package-json")
    , processDependency = require("./process-dependency");

const prodRejectModes = new Set(["dev", "optional"]);
const devRejectModes = new Set(["prod", "optional"]);

const setupRequiredDependencies = async (
	packageContext,
	userConfiguration,
	inputOptions,
	progressData
) => {
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
	if (topPackageName && (topPackageName !== name || devRejectModes.has(installMode))) return;
	log.debug("for %s setup dev dependencies %o", name, devDependencies);
	for (const dependencyName of devDependencies) {
		await processDependency(
			packageContext, dependencyName, userConfiguration, inputOptions, progressData
		);
	}
};

const setupOptionalDependencies = async (
	packageContext,
	userConfiguration,
	inputOptions,
	progressData
) => {
	const { dependencies, name, packageJson } = packageContext;
	const { installMode } = inputOptions;
	const { topPackageName } = progressData;

	const optionalDependencies = new Set(
		Object.keys(packageJson.optionalDependencies || {}).filter(
			dependencyName => dependencyName !== name && !dependencies.has(dependencyName)
		)
	);
	if (!optionalDependencies.size) return;
	for (const dependencyName of optionalDependencies) dependencies.add(dependencyName);

	if (topPackageName === name && installMode === "dev") return;
	log.info("for %s setup optional dependencies %o", name, optionalDependencies);
	for (const dependencyName of optionalDependencies) {
		await processDependency(
			packageContext, dependencyName, userConfiguration, inputOptions, progressData, true
		);
	}
};

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { path } = packageContext;
	if (!packageContext.packageJson) packageContext.packageJson = getPackageJson(path);
	const { packageJson } = packageContext;
	if (!packageJson) return;

	packageContext.dependenciesContext = new Map();

	await setupRequiredDependencies(packageContext, userConfiguration, inputOptions, progressData);

	await setupOptionalDependencies(packageContext, userConfiguration, inputOptions, progressData);
};
