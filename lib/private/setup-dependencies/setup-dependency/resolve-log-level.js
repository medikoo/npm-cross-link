"use strict";

module.exports = (packageContext, progressData) => {
	if (!progressData.topPackageName) return "warn";
	if (progressData.topPackageName === packageContext.name) return "warn";
	return "notice";
};
