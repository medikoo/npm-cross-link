"use strict";

const { basename, resolve } = require("path")
    , memoizee              = require("memoizee")
    , logger                = require("log4").get("setup-own-package")
    , resolveStats          = require("./resolve-stats")
    , runProgram            = require("./run-program")
    , setupRepository       = require("./setup-repository")
    , setupSymbolicLink     = require("./setup-symbolic-link");

const setupPrettierPackage = memoizee(
	async packagesPath => {
		const prettierPath = resolve(packagesPath, "prettier-elastic");
		logger.notice("setup prettier package");
		await setupRepository(prettierPath, "git@github.com:medikoo/prettier-elastic.git");
		logger.notice("install %s", prettierPath);
		await runProgram("yarn", [], {
			cwd: prettierPath,
			logger: logger.levelRoot.get("yarn:install")
		});
	},
	{ promise: true }
);

module.exports = async (packagesPath, packagePath) => {
	const symbolicLinkPath = resolve(packagePath, "node_modules/prettier");
	if (await resolveStats(symbolicLinkPath)) return;
	await setupPrettierPackage(packagesPath);
	logger.notice("link %s in %s", "prettier", basename(packagePath));
	await setupSymbolicLink(resolve(packagesPath, "prettier-elastic"), symbolicLinkPath);
};
