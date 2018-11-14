"use strict";

const npmLinkDependency = require("./npm-link-dependency");

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependentContext, name, isExternal } = dependencyContext;
	const { done, ongoing } = progressData;
	if (!isExternal) {
		if (!ongoing.has(name) && !done.has(name)) {
			// Cyclic module dependency, hence required on spot
			await require("../../install-package")(
				{ name }, userConfiguration, inputOptions, progressData
			);
		}
		if ((done.get(name) || ongoing.get(name)).installationJobs.size) {
			dependentContext.installationJobs.add(`setup-dependency:${ name }`);
		}
	}
	await npmLinkDependency(dependencyContext, progressData);
};
