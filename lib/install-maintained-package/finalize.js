"use strict";

const clear = require("es5-ext/array/#/clear")
    , log   = require("log").get("npm-cross-link");

module.exports = async (packageContext, progressData) => {
	const { name } = packageContext;
	const { done, ongoing } = progressData;
	log.debug("mark %s as done", name);
	done.set(name, packageContext);
	log.debug("remove %s from ongoing", name);
	ongoing.delete(name);

	// Run after jobs
	const { installationHooks: { after: jobs } } = packageContext;
	if (jobs.length) {
		log.info("run pending jobs of %s", name);
		for (const job of jobs) await job();
		clear.call(jobs);
	}
	progressData.emit("end", packageContext);
};
