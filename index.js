"use strict";

const partial     = require("es5-ext/function/#/partial")
    , startsWith  = require("es5-ext/string/#/starts-with")
    , deferred    = require("deferred")
    , exec        = require("exec-batch/exec")
    , lstat       = require("fs2/lstat")
    , mkdir       = require("fs2/mkdir")
    , symlink     = require("fs2/symlink")
    , { resolve } = require("path")
    , packages    = require("./packages");

const { keys } = Object
    , root = process.cwd()
    , dir = resolve(root, "modules")
    , done = Object.create(null)
    , done2 = Object.create(null);

require("events").EventEmitter.defaultMaxListeners = Infinity;

const setup = function (at, name) {
	if (done2[`${ at }|${ name }`]) return null;
	done2[`${ at }|${ name }`] = true;
	if (!packages[name]) return exec(`npm install ${ name }`, { cwd: at });
	const path = resolve(at, "node_modules", name);
	return lstat(resolve(path))(
		stats => {
			if (!stats.isSymbolicLink()) {
				throw new Error(`Path '${ path }' is not a symbolic link`);
			}
		},
		err => {
			if (err.code !== "ENOENT") throw err;
			return deferred(
				mkdir(resolve(at, "node_modules"), { intermediate: true }), setupGit(name)
			)(() => symlink(resolve(dir, name), resolve(at, "node_modules", name)));
		}
	);
};

const setupGit = function (name) {
	if (done[name]) return null;
	done[name] = true;
	return lstat(resolve(dir, name))(
		stats => {
			if (!stats.isDirectory()) {
				throw new Error(`Path '${ name }' is not adirectory`);
			}
			console.log("Do pull of", name);
			return exec("git pull", { cwd: resolve(dir, name) });
		},
		err => {
			let gitName, repoName;
			if (err.code !== "ENOENT") throw err;
			gitName = packages[name] === true ? name : packages[name];
			repoName = startsWith.call(gitName, "git@")
				? gitName
				: `git@github.com:medikoo/${ gitName }.git`;
			return exec(`git clone ${ repoName } ${ name }`, { cwd: dir }).aside(null, err => {
				console.log(`Repository '${ repoName }' not found`);
			});
		}
	)(() => {
		const dRequire = require
		    , conf = dRequire(resolve(dir, name, "package.json"))
		    , path = resolve(dir, name)
		    , lSetup = deferred.gate(partial.call(setup, path), 1);

		return deferred(
			deferred.map(keys(conf.dependencies || {}) || [], lSetup),
			deferred.map(keys(conf.devDependencies || {}) || [], lSetup),
			deferred.map(keys(conf.peerDependencies || {}) || [], lSetup)
		);
	});
};

mkdir(dir, { intermediate: true })(() =>
	deferred.map(keys(packages), deferred.gate(setupGit, 1))
).done();
