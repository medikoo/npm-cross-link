"use strict";

const previousKeys = new Set([
	"name", "version", "description", "author", "contributors", "keywords", "repository",
	"dependencies", "devDependencies"
]);

module.exports = (packageJson, sectionName, sectionContent) => {
	const pastKeys = new Set(
		(() => {
			switch (sectionName) {
				case "dependencies":
					return ["devDependencies", "optionalDependencies"];
				case "devDependencies":
					return ["optionalDependencies"];
				default:
					return [];
			}
		})()
	);
	const entries = Object.entries(packageJson);
	let sectionIndex = 0;
	entries.some(([key], index) => {
		if (pastKeys.has(key)) {
			sectionIndex = index;
			return true;
		}
		if (previousKeys.has(key)) sectionIndex = index + 1;
		return false;
	});
	entries.splice(sectionIndex, 0, [sectionName, sectionContent]);
	const result = {};
	for (const [key, value] of entries) result[key] = value;
	return result;
};
