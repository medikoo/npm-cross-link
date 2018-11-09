"use strict";

const lstat = require("fs2/lstat");

module.exports = async path => {
	try {
		return await lstat(path);
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
};
