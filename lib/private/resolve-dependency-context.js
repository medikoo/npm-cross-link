"use strict";

module.exports = (packageContext, name, userConfiguration) => {
	const { packagesMeta } = userConfiguration;
	return { dependentContext: packageContext, name, isExternal: !packagesMeta[name] };
};
