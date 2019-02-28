"use strict";

module.exports = entries => {
	const result = {};
	for (const [name, versionRange] of Array.from(entries).sort(([name1], [name2]) =>
		name1.localeCompare(name2)
	)) {
		result[name] = versionRange;
	}
	return result;
};
