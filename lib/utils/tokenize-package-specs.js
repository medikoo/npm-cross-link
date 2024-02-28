"use strict";

const ensureObject      = require("es5-ext/object/valid-object")
    , ensureString      = require("es5-ext/object/validate-stringifiable-value")
    , ensurePackageName = require("../ensure-package-name");

module.exports = packageSpecs =>
	Array.from(ensureObject(packageSpecs), packageSpec => {
		packageSpec = ensureString(packageSpec);
		if (packageSpec.slice(1).includes("@")) {
			return {
				name: ensurePackageName(packageSpec.slice(0, packageSpec.lastIndexOf("@"))),
				versionRange: packageSpec.slice(packageSpec.lastIndexOf("@") + 1)
			};
		}
		return { name: ensurePackageName(packageSpec) };
	});
