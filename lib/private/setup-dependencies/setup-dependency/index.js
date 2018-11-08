"use strict";

const npmLinkDependency = require("./npm-link-dependency");

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependency, isExternal } = dependencyContext;
	const { done, ongoingMap } = progressData;
	if (!isExternal) {
		if (ongoingMap.has(dependency.name)) {
			ongoingMap
				.get(dependency.name)
				.push(() => npmLinkDependency(dependencyContext, progressData));
			return;
		}
		if (!done.has(dependency.name)) {
			// Cyclic module dependency, hence required on spot
			await require("../../install-package")(
				{ name: dependency.name }, userConfiguration, inputOptions, progressData
			);
		}
	}
	await npmLinkDependency(dependencyContext, progressData);
};
