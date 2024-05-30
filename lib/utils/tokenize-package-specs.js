"use strict";

const ensureObject      = require("es5-ext/object/valid-object")
    , ensureString      = require("es5-ext/object/validate-stringifiable-value")
    , ensurePackageName = require("../ensure-package-name")
    , isSemVerRange     = require("./is-sem-ver-range");

module.exports = packageSpecs =>
	Array.from(ensureObject(packageSpecs), packageSpec => {
		packageSpec = ensureString(packageSpec);
		if (packageSpec.slice(1).includes("@")) {
			const versionRange = packageSpec.slice(packageSpec.lastIndexOf("@") + 1);
			return {
				name: ensurePackageName(packageSpec.slice(0, packageSpec.lastIndexOf("@"))),
				versionRange,
				isSemVerVersionRange: isSemVerRange(versionRange),
			};
		}
		return { name: ensurePackageName(packageSpec) };
	});
