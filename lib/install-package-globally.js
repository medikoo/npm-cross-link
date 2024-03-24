"use strict";

const log                      = require("log").get("npm-cross-link")
    , wait                     = require("timers-ext/promise/sleep")
    , semver                   = require("semver")
    , installMaintainedPackage = require("./install-maintained-package")
    , NpmCrossLinkError        = require("./npm-cross-link-error")
    , resolveExternalContext   = require("./resolve-external-context")
    , resolveLocalContext      = require("./resolve-local-context")
    , cachePackage             = require("./cache-package");

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { name, versionRange } = packageContext;
	const { packagesMeta } = userConfiguration;
	const isExternal = !packagesMeta[name];

	packageContext.installationJobs = new Set();

	// Ensure to emit "start" event in next event loop
	await wait();
	progressData.emit("start", packageContext);

	if (!isExternal) {
		const { ongoing, done } = progressData;
		// Esure we have it installed locally
		if (!ongoing.has(name) && !done.has(name)) {
			await installMaintainedPackage({ name }, userConfiguration, inputOptions, progressData);
		}

		if (!versionRange || versionRange === "latest") {
			progressData.emit("end", packageContext);
			return;
		}

		const { localVersion } = resolveLocalContext(
			packageContext, userConfiguration, progressData
		);

		if (localVersion && semver.satisfies(localVersion, versionRange)) {
			progressData.emit("end", packageContext);
			return;
		}
		log.error(
			"%s will have %s version installed externally as non latest version is referenced",
			name, versionRange
		);
	}

	const externalContext = await resolveExternalContext(packageContext, progressData);
	if (!externalContext) {
		throw new NpmCrossLinkError(
			`Cannot install "${ name }" globally. It's doesn't seem to be published`
		);
	}
	await cachePackage(
		name, packageContext.latestSupportedPublishedVersion || versionRange, externalContext
	);
};
