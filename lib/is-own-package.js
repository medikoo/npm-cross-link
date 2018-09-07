"use strict";

const logger    = require("log4").get("setup-own-package")
    , memoize   = require("memoizee")
    , GithubApi = require("@octokit/rest");

const github = new GithubApi({ timeout: 5000 });

github.authenticate({ type: "token", token: "fbd9200ea1ebe04b80470475a15fb60e17f3587f" });

const getReposPage = async ({ page }) => {
	// eslint-disable-next-line camelcase
	const { data } = await github.repos.getForUser({ username: "medikoo", page, per_page: 100 });
	const repos = data.filter(repo => !repo.fork).map(repo => repo.name);
	if (data.length === 100) repos.push(...await getReposPage({ page: page + 1 }));
	return repos;
};

const getRepos = memoize(async () => {
	logger.notice("resolve own package names");
	return new Set(await getReposPage({ page: 1 }), { promise: true });
});

module.exports = async packageName => (await getRepos()).has(packageName);
