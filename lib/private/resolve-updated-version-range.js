"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , semver           = require("semver");

const versionRangeRe = /^(?:(\^|~)(\d+)(?:\.\d+(?:\.\d+)?)?|(\d+)(\.\d+)?)$/u;

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

	const usedVersionRangePrefix = versionRangeMatch && versionRangeMatch[1];
	const targetVersionRangePrefix = (() => {
		if (!versionRangeMatch) return "^";
		if (usedVersionRangePrefix) {
			if (versionRangeMatch[2] === "0") return "^";
			return usedVersionRangePrefix;
		}
		if (versionRangeMatch[4]) {
			if (versionRangeMatch[3] === "0") return "^";
			return "~";
		}
		return "^";
	})();
	if (latestSupportedPublishedVersion) {
		return `${ targetVersionRangePrefix }${ latestSupportedPublishedVersion }`;
	}
	const localVersion = optionalChaining(localContext, "localVersion");
	if (!versionRange || versionRange === "latest") return `^${ localVersion }`;
	const coercedVersionRange = semver.coerce(versionRange.slice(usedVersionRangePrefix ? 1 : 0));
	if (localVersion && semver.gt(localVersion, coercedVersionRange)) {
		return `${ targetVersionRangePrefix }${ localVersion }`;
	}
	if (coercedVersionRange !== versionRange) {
		return `${ targetVersionRangePrefix }${ coercedVersionRange }`;
	}
	return null;
};
