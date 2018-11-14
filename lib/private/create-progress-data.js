"use strict";

const ee = require("event-emitter");

module.exports = () => ee({ done: new Set(), ongoing: new Map(), externals: new Map() });
