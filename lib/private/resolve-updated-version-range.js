"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , semver           = require("semver");

const versionRangeRe = /^(?:(\^|~)\d+(?:\.\d+(?:\.\d+)?)?|\d+)$/u;

module.exports = dependencyContext => {
	const {
		forcedVersionRange,
		versionRange,
		packageJsonVersionRange,
		latestSupportedPublishedVersion,
		localContext
	} = dependencyContext;

	const versionRangeMatch = versionRange && versionRange.match(versionRangeRe);
	if (versionRange && !versionRangeMatch) {
		if (!forcedVersionRange) return null;
		if (versionRange === packageJsonVersionRange) return null;
		if (versionRange !== "latest") return versionRange;
	}
	const versionRangePrefix = (versionRangeMatch && versionRangeMatch[1]) || "^";
	if (latestSupportedPublishedVersion) {
		return `${ versionRangePrefix }${ latestSupportedPublishedVersion }`;
	}
	const localVersion = optionalChaining(localContext, "localVersion");
	if (!versionRange || versionRange === "latest") return `^${ localVersion }`;
	const coercedVersionRange = semver.coerce(versionRange.slice(versionRangeMatch[1] ? 1 : 0));
	if (localVersion && semver.gt(localVersion, coercedVersionRange)) {
		return `${ versionRangePrefix }${ localVersion }`;
	}
	if (coercedVersionRange !== versionRange) {
		return `${ versionRangePrefix }${ coercedVersionRange }`;
	}
	return null;
};
