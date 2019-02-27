"use strict";

const { resolve }             = require("path")
    , log                     = require("log").get("npm-cross-link")
    , wait                    = require("timers-ext/promise/sleep")
    , rm                      = require("fs2/rm")
    , NpmCrossLinkError       = require("../npm-cross-link-error")
    , getNpmModulesPath       = require("../get-npm-modules-path")
    , runProgram              = require("../run-program")
    , nonOverridableExternals = require("./non-overridable-externals")
    , resolveExternalContext  = require("./resolve-external-context");

module.exports = async (packageContext, userConfiguration, inputOptions, progressData) => {
	const { name } = packageContext;
	const { packagesMeta } = userConfiguration;
	if (packagesMeta[name]) {
		throw new NpmCrossLinkError(
			`Cannot install "${ name }" globally. It's not recognized as a maintained package`
		);
	}
	if (nonOverridableExternals.has(name)) {
		throw new NpmCrossLinkError(
			`Cannot install "${ name }" globally. It should not be installed with npm-cross-link`
		);
	}
	packageContext.installationJobs = new Set();

	// Ensure to emit "start" event in next event loop
	await wait();
	progressData.emit("start", packageContext);

	const linkedPath = (packageContext.linkedPath = resolve(await getNpmModulesPath(), name));

	const externalContext = await resolveExternalContext(packageContext, progressData);
	if (!externalContext) {
		throw new NpmCrossLinkError(
			`Cannot install "${ name }" globally. It's doesn't seem to be published`
		);
	}
	const { globallyInstalledVersion, latestVersion } = externalContext;
	if (!latestVersion) {
		throw new NpmCrossLinkError(
			`Cannot install "${ name }" globally. There's no latest version tagged`
		);
	}

	// Lastest version supported, ensure it's linked
	if (globallyInstalledVersion === latestVersion) return;
	if (globallyInstalledVersion) {
		packageContext.installationType = "update";
		log.notice(
			"%s outdated at global folder (got %s expected %s), upgrading", name,
			globallyInstalledVersion, latestVersion
		);
	} else {
		packageContext.installationType = "install";
		log.notice("%s not installed at global folder, linking", name);
	}
	// Global node_modules hosts outdated version, cleanup
	await rm(linkedPath, { loose: true, recursive: true, force: true });

	await runProgram("npm", ["install", "-g", `${ name }@${ latestVersion }`], {
		logger: log.levelRoot.get("npm:link")
	});

	progressData.emit("end", packageContext);
};
