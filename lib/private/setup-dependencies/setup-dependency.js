"use strict";

const npmLink = require("./npm-link-dependency");

module.exports = async (dependencyContext, userConfiguration, inputOptions, progressData) => {
	const { dependencyName, isExternal } = dependencyContext;
	const { done, ongoingMap } = progressData;
	if (!isExternal) {
		if (ongoingMap.has(dependencyName)) {
			ongoingMap.get(dependencyName).push(() => npmLink(dependencyContext, progressData));
			return;
		}
		if (!done.has(dependencyName)) {
			// Cyclical dependncy, hence required on spot
			await require("../install-package")(
				{ name: dependencyName }, userConfiguration, inputOptions, progressData
			);
		}
	}
	await npmLink(dependencyContext, progressData);
};
