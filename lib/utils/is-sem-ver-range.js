"use strict";

const semver = require("semver");

module.exports = versionRange => {
	if (versionRange === "latest") return true;
	return semver.validRange(versionRange);
};
