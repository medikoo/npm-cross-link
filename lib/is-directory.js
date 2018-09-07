"use strict";

const resolveStats = require("./resolve-stats");

module.exports = async path => {
	const stats = await resolveStats(path);
	return stats ? stats.isDirectory() : null;
};
