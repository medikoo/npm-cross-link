"use strict";

const { resolve }                 = require("path")
    , log                         = require("log4").get("npm-cross-link")
    , isDirectory                 = require("fs2/is-directory")
    , npmLink                     = require("./npm-link")
    , NpmCrossLinkError           = require("../../npm-cross-link-error")
    , setupRepository             = require("../../setup-repository")
    , cleanupNpmInstall           = require("../cleanup-npm-install")
    , removeNonDirectDependencies = require("../remove-non-direct-dependencies");

const finalize = async ({ name }, progressData) => {
	const { done, ongoing } = progressData;
	log.debug("mark %s as done", name);
	done.add(name);

	const pendingJobs = ongoing.get(name);
	log.debug("remove %s from ongoing", name);
	ongoing.delete(name);

	// Run pending jobs
	if (pendingJobs.length) {
		log.info("run pending jobs of %s", name);
		for (const pendingJob of pendingJobs) await pendingJob();
	}
	progressData.emit("end", { name });
};

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { name } = packageContext;
	const { hooks, packagesPath, packagesMeta } = userConfiguration;
	const { ongoing } = progressData;
	if (!packagesMeta[name]) {
		throw new NpmCrossLinkError(
			`Cannot install package. "${ name }" is not recognized as a dev package`
		);
	}
	const meta = (packageContext.meta = packagesMeta[name]);
	const path = (packageContext.path = resolve(packagesPath, name));

	progressData.emit("start", { name, type: (await isDirectory(path)) ? "update" : "install" });

	log.debug("mark %s as ongoing", name);
	ongoing.set(name, []);

	// Ensure repository is up to date
	await setupRepository(path, meta.repoUrl, inputOptions);

	// Cleanup outcome of eventual previous npm crashes
	await cleanupNpmInstall(packageContext);

	// Setup dependencies
	// (cyclic module dependency, hence required on spot)
	await require("../setup-dependencies")(
		packageContext, userConfiguration, inputOptions, progressData
	);

	// Link package
	await npmLink(packageContext);

	// Run eventual afterPackageInstall hooks
	if (hooks.afterPackageInstall) {
		await hooks.afterPackageInstall(packageContext, userConfiguration, inputOptions);
	}

	// Cleanup unexpected dependencies from node_modules
	await removeNonDirectDependencies(packageContext, userConfiguration);

	// Notify and cleanup
	return finalize(packageContext, progressData);
};
