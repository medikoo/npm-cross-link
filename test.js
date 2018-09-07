"use strict";

require("grand-stack-trace/nodejs").setup();
require("grand-stack-trace/event-emitter").setup();

process.on("unhandledRejection", reason => { throw reason; });

require("log4-nodejs")();

const { resolve } = require("path")
    , { symlink } = require("fs");

const root = process.cwd();

symlink(resolve(root, "lib"), resolve(root, "lib-link"), { type: "dir" }, err => {
	if (err) throw err;
});
