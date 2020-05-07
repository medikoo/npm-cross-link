"use strict";

module.exports = (packageContext, progressData) => {
	if (!progressData.topPackageName) return "notice";
	if (progressData.topPackageName === packageContext.name) return "notice";
	return "info";
};
