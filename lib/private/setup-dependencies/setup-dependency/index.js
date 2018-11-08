"use strict";

const npmLinkDependency = require("./npm-link-dependency");

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { name, isExternal } = dependencyContext;
	const { done, ongoingMap } = progressData;
	if (!isExternal) {
		if (ongoingMap.has(name)) {
			ongoingMap.get(name).push(() => npmLinkDependency(dependencyContext, progressData));
			return;
		}
		if (!done.has(name)) {
			// Cyclic module dependency, hence required on spot
			await require("../../install-package")(
				{ name }, userConfiguration, inputOptions, progressData
			);
		}
	}
	await npmLinkDependency(dependencyContext, progressData);
};
