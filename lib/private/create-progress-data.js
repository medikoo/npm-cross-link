"use strict";

const ee = require("event-emitter");

module.exports = () =>
	ee({ done: new Map(), ongoing: new Map(), externals: new Map(), locals: new Map() });
