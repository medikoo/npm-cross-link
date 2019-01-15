"use strict";

const npmLinkDependency = require("./npm-link-dependency");

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependentContext, name, isExternal } = dependencyContext;
	const { done, ongoing } = progressData;
	if (!isExternal) {
		// If it's local ensure we have it installed locally
		if (!ongoing.has(name) && !done.has(name)) {
			// Cyclic module dependency, hence required on spot
			await require("../../install-package")(
				{ name }, userConfiguration, inputOptions, progressData
			);
		}
		const dependencyInstallationJobs = (done.get(name) || ongoing.get(name)).installationJobs;
		if (dependencyInstallationJobs.size) {
			dependentContext.installationJobs.add(
				`${ dependencyInstallationJobs.has("clone") ? "install" : "update" }-dependency:${
					name
				}`
			);
		}
	}
	await npmLinkDependency(dependencyContext, progressData);
};
