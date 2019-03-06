"use strict";

const optionalChaining = require("es5-ext/optional-chaining")
    , semver           = require("semver");

const isUpdatableVersionRange = RegExp.prototype.test.bind(/^(?:\^\d+(?:\.\d+(?:\.\d+)?)?|\d+)$/u);

module.exports = dependencyContext => {
	const {
		forcedVersionRange,
		versionRange,
		packageJsonVersionRange,
		latestSupportedPublishedVersion,
		localContext
	} = dependencyContext;

	if (versionRange && !isUpdatableVersionRange(versionRange)) {
		if (!forcedVersionRange) return null;
		if (versionRange === packageJsonVersionRange) return null;
		if (versionRange !== "latest") return versionRange;
	}
	if (latestSupportedPublishedVersion) return `^${ latestSupportedPublishedVersion }`;
	const localVersion = optionalChaining(localContext, "localVersion");
	if (!versionRange || versionRange === "latest") return `^${ localVersion }`;
	const coercedVersionRange = semver.coerce(versionRange.slice(versionRange[0] === "^" ? 1 : 0));
	if (localVersion && semver.gt(localVersion, coercedVersionRange)) return `^${ localVersion }`;
	if (coercedVersionRange !== versionRange) return `^${ coercedVersionRange }`;
	return null;
};
