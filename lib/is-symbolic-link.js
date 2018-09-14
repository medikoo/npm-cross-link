"use strict";

const lstat = require("fs2/lstat");

module.exports = async path => {
	const stats = await lstat(path, { loose: true });
	return stats ? stats.isSymbolicLink() : null;
};
