# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="3.0.3"></a>
## [3.0.3](https://github.com/medikoo/npm-cross-link/compare/v3.0.2...v3.0.3) (2018-11-15)


### Bug Fixes

* ensure to link before dependencies install ([c651bb7](https://github.com/medikoo/npm-cross-link/commit/c651bb7))



<a name="3.0.2"></a>
## [3.0.2](https://github.com/medikoo/npm-cross-link/compare/v3.0.1...v3.0.2) (2018-11-15)


### Bug Fixes

* fix NpmCrossLinkError constructor name ([bd57352](https://github.com/medikoo/npm-cross-link/commit/bd57352))
* fix progressData event so it reflects packageContext ([29c1bf7](https://github.com/medikoo/npm-cross-link/commit/29c1bf7))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/medikoo/npm-cross-link/compare/v3.0.0...v3.0.1) (2018-11-14)



<a name="3.0.0"></a>
# [3.0.0](https://github.com/medikoo/npm-cross-link/compare/v2.0.0...v3.0.0) (2018-11-14)


### Bug Fixes

* confirm on satisfiable version range in any case ([886bf3b](https://github.com/medikoo/npm-cross-link/commit/886bf3b))
* do not apply hooks to not maintaned packages ([aad10e7](https://github.com/medikoo/npm-cross-link/commit/aad10e7))


### Features

* do not expose pending jobs on pacakgeContext ([18648cb](https://github.com/medikoo/npm-cross-link/commit/18648cb))
* expose list of installation jobs per package ([f2663c4](https://github.com/medikoo/npm-cross-link/commit/f2663c4))
* expose progressData on result instead of just events ([ebcc284](https://github.com/medikoo/npm-cross-link/commit/ebcc284))
* Improve install in context of maintained ([a2ea872](https://github.com/medikoo/npm-cross-link/commit/a2ea872))
* minimize after hooks registration ([9095239](https://github.com/medikoo/npm-cross-link/commit/9095239))
* pass progressData with event, expose type on it ([3c2f8c3](https://github.com/medikoo/npm-cross-link/commit/3c2f8c3))
* reconfigure into two binaries ([3abed15](https://github.com/medikoo/npm-cross-link/commit/3abed15))
* reconfigure pendingJobs as after hooks ([cdd1a01](https://github.com/medikoo/npm-cross-link/commit/cdd1a01))
* rename hooks into installationHooks ([66a8f14](https://github.com/medikoo/npm-cross-link/commit/66a8f14))
* rename progressData.externalsMap to progressData.externals ([45db94a](https://github.com/medikoo/npm-cross-link/commit/45db94a))
* rename progressData.ongoingMap into progressData.ongoing ([a795dfd](https://github.com/medikoo/npm-cross-link/commit/a795dfd))
* rename type into installationType ([3e8ea0d](https://github.com/medikoo/npm-cross-link/commit/3e8ea0d))
* report eventual "update" as "processing" ([5b491eb](https://github.com/medikoo/npm-cross-link/commit/5b491eb))
* reuse packageContext as packageProgressData ([49a1839](https://github.com/medikoo/npm-cross-link/commit/49a1839))
* send report from setupRepository ([7a3fde4](https://github.com/medikoo/npm-cross-link/commit/7a3fde4))
* turn progressData.done to map ([9dc1847](https://github.com/medikoo/npm-cross-link/commit/9dc1847))


### BREAKING CHANGES

* `$ npm-cross-link install` now is represented by `$ npm-cross-link`
`$ npm-cross-link update-all` now is represented by
`$ npm-cross-link-update-all`
* Events are no longer exposed on result promise(instead they're accessible on promise.progressData)
* progressDataEvent.type was moved to progressDataEvent.progressData.type
* progressData.done is now a map not a set
* Pending jobs are now exposed on hooks.after result of ongoing item
* pacakgeContext.pendingJobs was removed
* progressData.externalsMap was renamed to progressData.externals
* progressData.ongoingMap was renamed to progressData.ongoing
* setupRepository instead of boolean now returns set
that states which operations were pursued



<a name="2.0.0"></a>
# [2.0.0](https://github.com/medikoo/npm-cross-link/compare/v1.1.1...v2.0.0) (2018-11-12)


### Features

* optionally pull changes from remote ([d7a297b](https://github.com/medikoo/npm-cross-link/commit/d7a297b))


### BREAKING CHANGES

* Changes from remote are now pulled optionally



<a name="1.1.1"></a>
## [1.1.1](https://github.com/medikoo/dev-package-install/compare/v1.1.0...v1.1.1) (2018-11-09)



<a name="1.1.0"></a>
# 1.1.0 (2018-11-09)


### Bug Fixes

* dependency setup ([6b7ed1d](https://github.com/medikoo/dev-package-install/commit/6b7ed1d))
* do not follow in case of not confirmed dev package ([c00f65b](https://github.com/medikoo/dev-package-install/commit/c00f65b))
* do not install on spot non semver install ([53c419f](https://github.com/medikoo/dev-package-install/commit/53c419f))
* ensure to clean progress on error exit ([51c75ed](https://github.com/medikoo/dev-package-install/commit/51c75ed))
* fix handling of optional dev packages ([1a2255e](https://github.com/medikoo/dev-package-install/commit/1a2255e))
* getPackageJson error handling ([67b0c41](https://github.com/medikoo/dev-package-install/commit/67b0c41))
* handling of optional dependencies ([39d8eb3](https://github.com/medikoo/dev-package-install/commit/39d8eb3))
* isValidSymlink handling ([9e7263e](https://github.com/medikoo/dev-package-install/commit/9e7263e))
* npm link setup ([0d775cf](https://github.com/medikoo/dev-package-install/commit/0d775cf))
* npm modules path ([4d49bf0](https://github.com/medikoo/dev-package-install/commit/4d49bf0))
* recognize `update` command in cli help ([d2be780](https://github.com/medikoo/dev-package-install/commit/d2be780))
* revert mistakenly commented out code ([4130c88](https://github.com/medikoo/dev-package-install/commit/4130c88))
* **cli:** --no-pull  arg resolution ([e114c2e](https://github.com/medikoo/dev-package-install/commit/e114c2e))
* symlink path check ([95987c6](https://github.com/medikoo/dev-package-install/commit/95987c6))
* update meta after version upgrade ([8dbe1e9](https://github.com/medikoo/dev-package-install/commit/8dbe1e9))
* update of linked external dependency ([c9f250c](https://github.com/medikoo/dev-package-install/commit/c9f250c))


### Features

* cli progress ([559719a](https://github.com/medikoo/dev-package-install/commit/559719a))
* differentiate between install and update operation ([0823b9f](https://github.com/medikoo/dev-package-install/commit/0823b9f))
* drop singleton nature ([83766d6](https://github.com/medikoo/dev-package-install/commit/83766d6))
* enable git push option ([2e91ec7](https://github.com/medikoo/dev-package-install/commit/2e91ec7))
* ensure npm link error to be fully exposed ([a449389](https://github.com/medikoo/dev-package-install/commit/a449389))
* ensure npm link points package at path ([5a82732](https://github.com/medikoo/dev-package-install/commit/5a82732))
* ensure to cleanup after npm crash ([cec7167](https://github.com/medikoo/dev-package-install/commit/cec7167))
* ensure to link dependency if link is not rigth ([51ffd5b](https://github.com/medikoo/dev-package-install/commit/51ffd5b))
* general install command ([976b463](https://github.com/medikoo/dev-package-install/commit/976b463))
* handle gently no packageJson case ([8629a5d](https://github.com/medikoo/dev-package-install/commit/8629a5d))
* host user specific configuration externally ([9fee809](https://github.com/medikoo/dev-package-install/commit/9fee809))
* ignore npm error if link was created ([8e9377b](https://github.com/medikoo/dev-package-install/commit/8e9377b))
* improve error message ([0e5a7ac](https://github.com/medikoo/dev-package-install/commit/0e5a7ac))
* improve error reporting ([18da647](https://github.com/medikoo/dev-package-install/commit/18da647))
* improve log message ([9bdcaf6](https://github.com/medikoo/dev-package-install/commit/9bdcaf6))
* improve logging ([50d9e6c](https://github.com/medikoo/dev-package-install/commit/50d9e6c))
* improve logging ([92d83a2](https://github.com/medikoo/dev-package-install/commit/92d83a2))
* improve npm error handling ([ef30cdb](https://github.com/medikoo/dev-package-install/commit/ef30cdb))
* improve repo update logic ([ab1fc26](https://github.com/medikoo/dev-package-install/commit/ab1fc26))
* improve warning message ([d030445](https://github.com/medikoo/dev-package-install/commit/d030445))
* inform of install type ([c2bdf25](https://github.com/medikoo/dev-package-install/commit/c2bdf25))
* inform on whether repository was created ([ef7cde3](https://github.com/medikoo/dev-package-install/commit/ef7cde3))
* introduce non dependency cleanup step ([eab04e9](https://github.com/medikoo/dev-package-install/commit/eab04e9))
* log error in case linked version mismatch version range ([613919f](https://github.com/medikoo/dev-package-install/commit/613919f))
* make options optional ([15ae780](https://github.com/medikoo/dev-package-install/commit/15ae780))
* make setupRepository public ([e27e653](https://github.com/medikoo/dev-package-install/commit/e27e653))
* mark end after pending jobs are finalized ([79aba42](https://github.com/medikoo/dev-package-install/commit/79aba42))
* new approach for linking/installing externals ([a82d3c2](https://github.com/medikoo/dev-package-install/commit/a82d3c2))
* new version ([8471227](https://github.com/medikoo/dev-package-install/commit/8471227))
* pass options to hook ([c32a1fc](https://github.com/medikoo/dev-package-install/commit/c32a1fc))
* put logs at hidden level, expose emitter ([0eca533](https://github.com/medikoo/dev-package-install/commit/0eca533))
* remove support for mirror 'update' command ([8a917de](https://github.com/medikoo/dev-package-install/commit/8a917de))
* rename from dev-package to npm-cross-link ([bf537ed](https://github.com/medikoo/dev-package-install/commit/bf537ed))
* rename main module to installPackage ([33fb754](https://github.com/medikoo/dev-package-install/commit/33fb754))
* rename skipGitUpdate to disableGitPull ([4643f51](https://github.com/medikoo/dev-package-install/commit/4643f51))
* seclude getPackageJson ([d80d71a](https://github.com/medikoo/dev-package-install/commit/d80d71a))
* simplify CLI args ([3724d59](https://github.com/medikoo/dev-package-install/commit/3724d59))
* simplify option names ([4aff319](https://github.com/medikoo/dev-package-install/commit/4aff319))
* **bin:** commands support in binary ([bcdabb6](https://github.com/medikoo/dev-package-install/commit/bcdabb6))
* **cli:** improve usage message ([f28d614](https://github.com/medikoo/dev-package-install/commit/f28d614))
* simplify skipGitUpdate handling ([81007d9](https://github.com/medikoo/dev-package-install/commit/81007d9))
* solidify npm modules path resolution ([59cda84](https://github.com/medikoo/dev-package-install/commit/59cda84))
* support recovery from any npm link error ([e162fa1](https://github.com/medikoo/dev-package-install/commit/e162fa1))
* support skipNestedGitUpdate option ([7434735](https://github.com/medikoo/dev-package-install/commit/7434735))
* support update command ([039d372](https://github.com/medikoo/dev-package-install/commit/039d372))
* update-all command ([26364b7](https://github.com/medikoo/dev-package-install/commit/26364b7))
* upgrade external when higher version is discovered ([407b616](https://github.com/medikoo/dev-package-install/commit/407b616))



<a name="1.0.0"></a>
# 1.0.0 (2018-11-09)


### Bug Fixes

* dependency setup ([c722a3e](https://github.com/medikoo/dev-package-install/commit/c722a3e))
* do not follow in case of not confirmed dev package ([102de35](https://github.com/medikoo/dev-package-install/commit/102de35))
* do not install on spot non semver install ([3699ead](https://github.com/medikoo/dev-package-install/commit/3699ead))
* ensure to clean progress on error exit ([20d006c](https://github.com/medikoo/dev-package-install/commit/20d006c))
* fix handling of optional dev packages ([3e0674f](https://github.com/medikoo/dev-package-install/commit/3e0674f))
* getPackageJson error handling ([10ecb9a](https://github.com/medikoo/dev-package-install/commit/10ecb9a))
* handling of optional dependencies ([9b2b093](https://github.com/medikoo/dev-package-install/commit/9b2b093))
* isValidSymlink handling ([770a939](https://github.com/medikoo/dev-package-install/commit/770a939))
* npm link setup ([8a3044a](https://github.com/medikoo/dev-package-install/commit/8a3044a))
* npm modules path ([ccd2c78](https://github.com/medikoo/dev-package-install/commit/ccd2c78))
* recognize `update` command in cli help ([3239e84](https://github.com/medikoo/dev-package-install/commit/3239e84))
* revert mistakenly commented out code ([7458650](https://github.com/medikoo/dev-package-install/commit/7458650))
* **cli:** --no-pull  arg resolution ([61cd13a](https://github.com/medikoo/dev-package-install/commit/61cd13a))
* symlink path check ([72b113a](https://github.com/medikoo/dev-package-install/commit/72b113a))
* update meta after version upgrade ([0e5fd56](https://github.com/medikoo/dev-package-install/commit/0e5fd56))
* update of linked external dependency ([fc0af8f](https://github.com/medikoo/dev-package-install/commit/fc0af8f))


### Features

* cli progress ([bfe041c](https://github.com/medikoo/dev-package-install/commit/bfe041c))
* differentiate between install and update operation ([d70afc8](https://github.com/medikoo/dev-package-install/commit/d70afc8))
* drop singleton nature ([a138b2e](https://github.com/medikoo/dev-package-install/commit/a138b2e))
* enable git push option ([08a7d11](https://github.com/medikoo/dev-package-install/commit/08a7d11))
* ensure npm link error to be fully exposed ([52e5137](https://github.com/medikoo/dev-package-install/commit/52e5137))
* ensure npm link points package at path ([f99b650](https://github.com/medikoo/dev-package-install/commit/f99b650))
* ensure to cleanup after npm crash ([6a84450](https://github.com/medikoo/dev-package-install/commit/6a84450))
* ensure to link dependency if link is not rigth ([796ce85](https://github.com/medikoo/dev-package-install/commit/796ce85))
* general install command ([b8dcbc1](https://github.com/medikoo/dev-package-install/commit/b8dcbc1))
* handle gently no packageJson case ([07a9adc](https://github.com/medikoo/dev-package-install/commit/07a9adc))
* host user specific configuration externally ([439abb1](https://github.com/medikoo/dev-package-install/commit/439abb1))
* ignore npm error if link was created ([c0dba47](https://github.com/medikoo/dev-package-install/commit/c0dba47))
* improve error message ([3ef6633](https://github.com/medikoo/dev-package-install/commit/3ef6633))
* improve error reporting ([05d6c6c](https://github.com/medikoo/dev-package-install/commit/05d6c6c))
* improve log message ([eb5acf0](https://github.com/medikoo/dev-package-install/commit/eb5acf0))
* improve logging ([2acf1c3](https://github.com/medikoo/dev-package-install/commit/2acf1c3))
* improve logging ([3b053f8](https://github.com/medikoo/dev-package-install/commit/3b053f8))
* improve npm error handling ([41f14a7](https://github.com/medikoo/dev-package-install/commit/41f14a7))
* improve repo update logic ([fca33a9](https://github.com/medikoo/dev-package-install/commit/fca33a9))
* improve warning message ([d63030c](https://github.com/medikoo/dev-package-install/commit/d63030c))
* inform of install type ([05a98ac](https://github.com/medikoo/dev-package-install/commit/05a98ac))
* inform on whether repository was created ([0602ab5](https://github.com/medikoo/dev-package-install/commit/0602ab5))
* introduce non dependency cleanup step ([51afdbc](https://github.com/medikoo/dev-package-install/commit/51afdbc))
* log error in case linked version mismatch version range ([df533f8](https://github.com/medikoo/dev-package-install/commit/df533f8))
* make options optional ([324d9da](https://github.com/medikoo/dev-package-install/commit/324d9da))
* make setupRepository public ([240dfea](https://github.com/medikoo/dev-package-install/commit/240dfea))
* mark end after pending jobs are finalized ([f492985](https://github.com/medikoo/dev-package-install/commit/f492985))
* new approach for linking/installing externals ([8eeef09](https://github.com/medikoo/dev-package-install/commit/8eeef09))
* new version ([40056aa](https://github.com/medikoo/dev-package-install/commit/40056aa))
* pass options to hook ([74503a4](https://github.com/medikoo/dev-package-install/commit/74503a4))
* put logs at hidden level, expose emitter ([a2b2d33](https://github.com/medikoo/dev-package-install/commit/a2b2d33))
* remove support for mirror 'update' command ([124ae32](https://github.com/medikoo/dev-package-install/commit/124ae32))
* rename main module to installPackage ([77e3b5e](https://github.com/medikoo/dev-package-install/commit/77e3b5e))
* rename skipGitUpdate to disableGitPull ([3aa6806](https://github.com/medikoo/dev-package-install/commit/3aa6806))
* seclude getPackageJson ([16e3126](https://github.com/medikoo/dev-package-install/commit/16e3126))
* simplify CLI args ([520d979](https://github.com/medikoo/dev-package-install/commit/520d979))
* simplify option names ([03b056a](https://github.com/medikoo/dev-package-install/commit/03b056a))
* **bin:** commands support in binary ([5117688](https://github.com/medikoo/dev-package-install/commit/5117688))
* **cli:** improve usage message ([2b7884d](https://github.com/medikoo/dev-package-install/commit/2b7884d))
* simplify skipGitUpdate handling ([0343807](https://github.com/medikoo/dev-package-install/commit/0343807))
* solidify npm modules path resolution ([9094fd5](https://github.com/medikoo/dev-package-install/commit/9094fd5))
* support recovery from any npm link error ([dd453d0](https://github.com/medikoo/dev-package-install/commit/dd453d0))
* support skipNestedGitUpdate option ([1fe3351](https://github.com/medikoo/dev-package-install/commit/1fe3351))
* support update command ([351a592](https://github.com/medikoo/dev-package-install/commit/351a592))
* update-all command ([39773c9](https://github.com/medikoo/dev-package-install/commit/39773c9))
* upgrade external when higher version is discovered ([4fe8591](https://github.com/medikoo/dev-package-install/commit/4fe8591))
