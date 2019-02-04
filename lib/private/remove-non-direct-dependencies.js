"use strict";

const { resolve } = require("path")
    , log         = require("log").get("npm-cross-link")
    , readdir     = require("fs2/readdir")
    , rm          = require("fs2/rm");

module.exports = async ({ name, path, dependencies }, { userDependencies }) => {
	const allowedPaths = new Set([".", "..", ".bin"]);
	const allDependencies = Array.from(dependencies).concat(userDependencies);
	const topDependencies = new Set(
		allDependencies.filter(dependencyName => !dependencyName.startsWith("@"))
	);
	const namespacedDependencies = new Map();
	for (const dependencyName of allDependencies) {
		if (!dependencyName.startsWith("@")) continue;
		const [namespace, subName] = dependencyName.split("/");
		if (!namespacedDependencies.has(namespace)) {
			namespacedDependencies.set(namespace, new Set());
		}
		namespacedDependencies.get(namespace).add(subName);
	}
	const packageNodeModulesPath = resolve(path, "node_modules");
	return Promise.all(
		((await readdir(packageNodeModulesPath, { loose: true })) || []).map(
			async dependencyName => {
				if (allowedPaths.has(dependencyName)) return null;
				if (topDependencies.has(dependencyName)) return null;
				if (namespacedDependencies.has(dependencyName)) {
					const dependencyNames = namespacedDependencies.get(dependencyName);
					await Promise.all(
						(await readdir(resolve(packageNodeModulesPath, dependencyName), {
							loose: true
						})).map(subDependencyName => {
							if (allowedPaths.has(subDependencyName)) return null;
							if (dependencyNames.has(subDependencyName)) return null;
							log.info(
								"in %s remove unexpected dependency %s", name,
								`${ dependencyName }/${ subDependencyName }`
							);
							return rm(
								resolve(packageNodeModulesPath, dependencyName, subDependencyName),
								{ force: true, loose: true, recursive: true }
							);
						})
					);
					return null;
				}
				log.info("in %s remove unexpected dependency %s", name, dependencyName);
				return rm(resolve(packageNodeModulesPath, dependencyName), {
					force: true,
					loose: true,
					recursive: true
				});
			}
		)
	);
};
