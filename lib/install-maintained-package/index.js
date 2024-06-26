"use strict";

const optionalChaining             = require("es5-ext/optional-chaining")
    , { resolve }                  = require("path")
    , log                          = require("log").get("npm-cross-link")
    , isDirectory                  = require("fs2/is-directory")
    , rm                           = require("fs2/rm")
    , NpmCrossLinkError            = require("../npm-cross-link-error")
    , getPackageJson               = require("../get-package-json")
    , cleanupNpmInstall            = require("../cleanup-npm-install")
    , setupRepository              = require("../setup-repository")
    , resolveExternalContext       = require("../resolve-external-context")
    , removeNonDirectDependencies  = require("../remove-non-direct-dependencies")
    , resolveMaintainedPackagePath = require("../resolve-maintained-package-path")
    , resolveLogLevel              = require("../utils/resolve-log-level")
    , finalize                     = require("./finalize");

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { name } = packageContext;
	const { hooks, packagesMeta } = userConfiguration;
	const { ongoing } = progressData;
	if (!packagesMeta[name]) {
		throw new NpmCrossLinkError(
			`Cannot install package. "${ name }" is not recognized as a maintained package`
		);
	}
	packageContext.meta = packagesMeta[name];
	const path = (packageContext.path = resolveMaintainedPackagePath(name, userConfiguration));
	if (!packageContext.packageJson) packageContext.packageJson = getPackageJson(path);
	packageContext.installationType = (await isDirectory(path)) ? "update" : "install";
	packageContext.installationHooks = { after: [] };

	log.debug("mark %s as ongoing", name);
	ongoing.set(name, packageContext);

	progressData.emit("start", packageContext);

	const packageJsonName = optionalChaining(packageContext.packageJson, "name");
	const isNameMismatch = (packageContext.isNameMismatch =
		packageJsonName && name !== packageJsonName);
	if (isNameMismatch) {
		log.error("%s is named as %s in package.json, unable to link", name, packageJsonName);
	}

	// Ensure repository is up to date
	packageContext.installationJobs = await setupRepository(
		packageContext, userConfiguration, inputOptions, progressData
	);

	if (
		packageContext.installationJobs.has("pull") ||
		packageContext.installationJobs.has("clone")
	) {
		// Refresh after update
		packageContext.packageJson = getPackageJson(path);
	}

	await resolveExternalContext(packageContext, progressData);
	if (
		packageContext.externalContext.latestVersion &&
		packageContext.externalContext.latestVersion !== packageContext.packageJson.version
	) {
		log[resolveLogLevel(packageContext, progressData)](
			"%s is at %s version which doesn't reflect %s latest version", name,
			packageContext.packageJson.version, packageContext.externalContext.latestVersion
		);
	}

	// Cleanup outcome of eventual previous npm crashes
	await cleanupNpmInstall(packageContext);

	// Setup dependencies
	// (cyclic module dependency, hence required on spot)
	await require("../setup-dependencies")(
		packageContext, userConfiguration, inputOptions, progressData
	);

	// Run eventual afterPackageInstall hooks
	if (hooks.afterPackageInstall) {
		await hooks.afterPackageInstall(packageContext, userConfiguration, inputOptions);
	}

	await Promise.all([
		// Ensure node_modules is clean from unrelated installs
		removeNonDirectDependencies(packageContext, userConfiguration),
		// package-lock.json is not intended for libraries
		rm(resolve(path, "package-lock.json"), { loose: true, recursive: true, force: true }),
	]);

	// Notify and cleanup
	return finalize(packageContext, progressData);
};
