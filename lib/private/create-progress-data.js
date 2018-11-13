"use strict";

const ee = require("event-emitter");

module.exports = () => ee({ done: new Set(), ongoingMap: new Map(), externalsMap: new Map() });
