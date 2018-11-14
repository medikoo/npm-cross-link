"use strict";

const clear                       = require("es5-ext/array/#/clear")
    , { resolve }                 = require("path")
    , log                         = require("log4").get("npm-cross-link")
    , isDirectory                 = require("fs2/is-directory")
    , npmLink                     = require("./npm-link")
    , NpmCrossLinkError           = require("../../npm-cross-link-error")
    , setupRepository             = require("../../setup-repository")
    , cleanupNpmInstall           = require("../cleanup-npm-install")
    , removeNonDirectDependencies = require("../remove-non-direct-dependencies");

const finalize = async ({ name }, progressData) => {
	const { done, ongoing } = progressData;
	const packageProgressData = ongoing.get(name);
	log.debug("mark %s as done", name);
	done.set(name, packageProgressData);
	log.debug("remove %s from ongoing", name);
	ongoing.delete(name);

	// Run after jobs
	const { hooks: { after: jobs } } = packageProgressData;
	if (jobs.length) {
		log.info("run pending jobs of %s", name);
		for (const job of jobs) await job();
		clear.call(jobs);
	}
	progressData.emit("end", { name, progressData: packageProgressData });
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
	const packageProgressData = {
		installationType: (await isDirectory(path)) ? "update" : "install",
		hooks: { after: [] }
	};

	log.debug("mark %s as ongoing", name);
	ongoing.set(name, packageProgressData);

	progressData.emit("start", { name, progressData: packageProgressData });

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
