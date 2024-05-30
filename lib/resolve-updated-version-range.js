"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , semver           = require("semver");

const versionRangeRe = new RegExp(
	"^(?:" +
		"(?<prefix>\\^|~)" +
		"(?<majorPrefixed>\\d+)" +
		"(?:\\.\\d+(?:\\.\\d+)?)?" +
		"|(?<majorNotPrefixed>\\d+)(?<minorNotPrefixed>\\.\\d+)?" +
		")$",
	"u"
);

module.exports = dependencyContext => {
	const {
		forcedVersionRange, // Forced via CLI
		versionRange, // forcedVersionRange || packageJsonVersionRange (can be null)
		packageJsonVersionRange,
		latestSupportedPublishedVersion,
		localContext,
	} = dependencyContext;

	const versionRangeMatch = versionRange && versionRange.match(versionRangeRe);
	if (versionRange && !versionRangeMatch) {
		if (!forcedVersionRange) return null;
		if (versionRange === packageJsonVersionRange) return null;
		if (versionRange !== "latest") return versionRange;
	}

	const usedVersionRangeData = versionRangeMatch && versionRangeMatch.groups;
	const targetVersionRangePrefix = (() => {
		if (!versionRangeMatch) return "^";
		if (usedVersionRangeData.prefix) {
			if (usedVersionRangeData.majorPrefixed === "0") return "^";
			return usedVersionRangeData.prefix;
		}
		if (usedVersionRangeData.minorNotPrefixed) {
			if (usedVersionRangeData.majorNotPrefixed === "0") return "^";
			return "~";
		}
		return "^";
	})();
	const localVersion = optionalChaining(localContext, "localVersion");
	if (
		latestSupportedPublishedVersion &&
		(!localVersion ||
			!semver.gt(latestSupportedPublishedVersion, localVersion) ||
			(versionRange &&
				(versionRange === "latest" || !semver.satisfies(localVersion, versionRange))))
	) {
		return `${ targetVersionRangePrefix }${ latestSupportedPublishedVersion }`;
	}
	if (!versionRange || versionRange === "latest") return `^${ localVersion }`;
	const coercedVersionRange = semver.coerce(
		versionRange.slice(usedVersionRangeData && usedVersionRangeData.prefix ? 1 : 0)
	);
	if (localVersion && semver.gt(localVersion, coercedVersionRange)) {
		return `${ targetVersionRangePrefix }${ localVersion }`;
	}
	if (coercedVersionRange !== versionRange) {
		return `${ targetVersionRangePrefix }${ coercedVersionRange }`;
	}
	return null;
};
