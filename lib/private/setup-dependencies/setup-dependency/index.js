"use strict";

const npmLinkDependency = require("./npm-link-dependency");

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependencyName, isExternal } = dependencyContext;
	const { done, ongoingMap } = progressData;
	if (!isExternal) {
		if (ongoingMap.has(dependencyName)) {
			ongoingMap
				.get(dependencyName)
				.push(() => npmLinkDependency(dependencyContext, progressData));
			return;
		}
		if (!done.has(dependencyName)) {
			// Cyclic module dependency, hence required on spot
			await require("../../install-package")(
				{ name: dependencyName }, userConfiguration, inputOptions, progressData
			);
		}
	}
	await npmLinkDependency(dependencyContext, progressData);
};
