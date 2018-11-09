"use strict";

module.exports = () => {
	const lines = [];
	return {
		lines,
		logger: {
			info(line) { lines.push(line); },
			error(line) { throw new Error(`Unexpected error line ${ line }`); }
		}
	};
};
