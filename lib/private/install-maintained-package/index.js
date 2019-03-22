"use strict";

const clear                         = require("es5-ext/array/#/clear")
    , optionalChaining              = require("es5-ext/optional-chaining")
    , { resolve }                   = require("path")
    , log                           = require("log").get("npm-cross-link")
    , isDirectory                   = require("fs2/is-directory")
    , rm                            = require("fs2/rm")
    , npmLink                       = require("./npm-link")
    , NpmCrossLinkError             = require("../../npm-cross-link-error")
    , setupRepository               = require("../../setup-repository")
    , getPackageJson                = require("../../get-package-json")
    , cleanupNpmInstall             = require("../cleanup-npm-install")
    , removeNonDirectDependencies   = require("../remove-non-direct-dependencies")
    , updatePackageJsonDependencies = require("../update-package-json-dependencies");

const finalize = async (packageContext, progressData) => {
	const { name } = packageContext;
	const { done, ongoing } = progressData;
	log.debug("mark %s as done", name);
	done.set(name, packageContext);
	log.debug("remove %s from ongoing", name);
	ongoing.delete(name);

	// Run after jobs
	const { installationHooks: { after: jobs } } = packageContext;
	if (jobs.length) {
		log.info("run pending jobs of %s", name);
		for (const job of jobs) await job();
		clear.call(jobs);
	}
	progressData.emit("end", packageContext);
};

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { name } = packageContext;
	const { hooks, packagesPath, packagesMeta } = userConfiguration;
	const { ongoing, topPackageName } = progressData;
	if (!packagesMeta[name]) {
		throw new NpmCrossLinkError(
			`Cannot install package. "${ name }" is not recognized as a maintained package`
		);
	}
	const meta = (packageContext.meta = packagesMeta[name]);
	const path = (packageContext.path = resolve(packagesPath, name));
	if (!packageContext.packageJson) packageContext.packageJson = getPackageJson(path);
	packageContext.installationType = (await isDirectory(path)) ? "update" : "install";
	packageContext.installationHooks = { after: [] };

	log.debug("mark %s as ongoing", name);
	ongoing.set(name, packageContext);

	progressData.emit("start", packageContext);

	const packageJsonName = optionalChaining(packageContext.packageJson, "name");
	if (packageJsonName && name !== packageJsonName) {
		log.error("%s is named as %s in package.json", name, packageJsonName);
	}

	// Ensure repository is up to date
	packageContext.installationJobs = await setupRepository(path, meta.repoUrl, inputOptions);

	// Cleanup outcome of eventual previous npm crashes
	await cleanupNpmInstall(packageContext);

	// Link package
	await npmLink(packageContext);

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
		// Keep dependencies in package.json fresh
		!inputOptions.global &&
			!inputOptions.noSave &&
			topPackageName === name &&
			updatePackageJsonDependencies(packageContext)
	]);

	// Notify and cleanup
	return finalize(packageContext, progressData);
};
