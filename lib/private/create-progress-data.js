"use strict";

const ee = require("event-emitter");

module.exports = () => ee({ done: new Set(), ongoing: new Map(), externalsMap: new Map() });
