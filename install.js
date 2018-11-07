"use strict";

const toPlainObject       = require("es5-ext/object/normalize-options")
    , ensureString        = require("es5-ext/object/validate-stringifiable-value")
    , ee                  = require("event-emitter")
    , unifyEmitters       = require("event-emitter/unify")
    , { resolve }         = require("path")
    , ensureConfiguration = require("./lib/private/ensure-user-configuration")
    , install             = require("./lib/private/install");

module.exports = (path, configuration, options = {}) => {
	path = resolve(ensureString(path));
	const progressData = ee({ done: new Set(), ongoingMap: new Map(), externalsMap: new Map() });
	const promise = ee(
		install({ path }, ensureConfiguration(configuration), toPlainObject(options), progressData)
	);
	unifyEmitters(progressData, promise);
	return promise;
};
