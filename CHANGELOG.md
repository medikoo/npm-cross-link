# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [7.7.2](https://github.com/medikoo/npm-cross-link/compare/v7.7.1...v7.7.2) (2019-05-16)

### Bug Fixes

- Fix repo status detection ([9a97f37](https://github.com/medikoo/npm-cross-link/commit/9a97f37))

## [7.7.1](https://github.com/medikoo/npm-cross-link/compare/v7.7.0...v7.7.1) (2019-04-09)

# [7.7.0](https://github.com/medikoo/npm-cross-link/compare/v7.6.2...v7.7.0) (2019-04-09)

### Features

- allow change of dependencies section ([62f044d](https://github.com/medikoo/npm-cross-link/commit/62f044d))

## [7.6.2](https://github.com/medikoo/npm-cross-link/compare/v7.6.1...v7.6.2) (2019-04-02)

### Bug Fixes

- do not bump outside of local version ([a5049dc](https://github.com/medikoo/npm-cross-link/commit/a5049dc))
- ensure to target latest published on latest ([8bfb6c1](https://github.com/medikoo/npm-cross-link/commit/8bfb6c1))

## [7.6.1](https://github.com/medikoo/npm-cross-link/compare/v7.6.0...v7.6.1) (2019-04-02)

### Bug Fixes

- do not bump version range to not published ([d741e62](https://github.com/medikoo/npm-cross-link/commit/d741e62))

# [7.6.0](https://github.com/medikoo/npm-cross-link/compare/v7.5.1...v7.6.0) (2019-03-26)

### Bug Fixes

- do not pursue link on name mismatch ([776dea4](https://github.com/medikoo/npm-cross-link/commit/776dea4))
- ensure proper installation ([5095b49](https://github.com/medikoo/npm-cross-link/commit/5095b49))
- fix error handling for non published packages ([ff9a5ca](https://github.com/medikoo/npm-cross-link/commit/ff9a5ca))

### Features

- ensure cleanup on name mismatch ([61543a8](https://github.com/medikoo/npm-cross-link/commit/61543a8))

## [7.5.1](https://github.com/medikoo/npm-cross-link/compare/v7.5.0...v7.5.1) (2019-03-25)

### Bug Fixes

- ensure to retrieve fresh package.json ([739f390](https://github.com/medikoo/npm-cross-link/commit/739f390))

# [7.5.0](https://github.com/medikoo/npm-cross-link/compare/v7.4.0...v7.5.0) (2019-03-22)

### Features

- validate wrong naming in package.json ([37d669e](https://github.com/medikoo/npm-cross-link/commit/37d669e))

# [7.4.0](https://github.com/medikoo/npm-cross-link/compare/v7.3.1...v7.4.0) (2019-03-22)

### Features

- publicize getPackageJson util ([1519a06](https://github.com/medikoo/npm-cross-link/commit/1519a06))

## [7.3.1](https://github.com/medikoo/npm-cross-link/compare/v7.3.0...v7.3.1) (2019-03-20)

### Bug Fixes

- ensure proper generation of new deps section ([b1091d1](https://github.com/medikoo/npm-cross-link/commit/b1091d1))

# [7.3.0](https://github.com/medikoo/npm-cross-link/compare/v7.2.0...v7.3.0) (2019-03-13)

### Features

- intelligent new version range resolution ([de9c213](https://github.com/medikoo/npm-cross-link/commit/de9c213))
- support automatic update for ~ version range ([265a6b9](https://github.com/medikoo/npm-cross-link/commit/265a6b9))

# [7.2.0](https://github.com/medikoo/npm-cross-link/compare/v7.1.0...v7.2.0) (2019-03-06)

### Bug Fixes

- unify log messages ([961116a](https://github.com/medikoo/npm-cross-link/commit/961116a))

### Features

- support target in githubRepo notation ([d0ab097](https://github.com/medikoo/npm-cross-link/commit/d0ab097))

# [7.1.0](https://github.com/medikoo/npm-cross-link/compare/v7.0.2...v7.1.0) (2019-03-06)

### Features

- recognize "latest" version range ([e080cc2](https://github.com/medikoo/npm-cross-link/commit/e080cc2))

## [7.0.2](https://github.com/medikoo/npm-cross-link/compare/v7.0.1...v7.0.2) (2019-03-06)

### Bug Fixes

- fix package.json whitespace detection ([b4c9f4d](https://github.com/medikoo/npm-cross-link/commit/b4c9f4d))

## [7.0.1](https://github.com/medikoo/npm-cross-link/compare/v7.0.0...v7.0.1) (2019-03-05)

### Bug Fixes

- bring back general install option ([557abde](https://github.com/medikoo/npm-cross-link/commit/557abde))

# [7.0.0](https://github.com/medikoo/npm-cross-link/compare/v6.2.0...v7.0.0) (2019-03-05)

### Bug Fixes

- do not crash for non existing remotes ([a47a216](https://github.com/medikoo/npm-cross-link/commit/a47a216))

### Code Refactoring

- pave path for installDependencies feature ([1d3a7db](https://github.com/medikoo/npm-cross-link/commit/1d3a7db))
- rename module ([78ec6ad](https://github.com/medikoo/npm-cross-link/commit/78ec6ad))

### Features

- improve log message ([8f26854](https://github.com/medikoo/npm-cross-link/commit/8f26854))
- improve logging ([936ee4e](https://github.com/medikoo/npm-cross-link/commit/936ee4e))
- support install of multiple dependencies ([75ae8ef](https://github.com/medikoo/npm-cross-link/commit/75ae8ef))
- support multiple global install ([e1b1284](https://github.com/medikoo/npm-cross-link/commit/e1b1284))

### BREAKING CHANGES

- install-maintaned-package.js was removed in favor of
  install-packages-globally.js
- install-package-globally.js got replaced by install-packages-globally.js
- install-dependency.js was replaced with install-dependencies.js

# [6.2.0](https://github.com/medikoo/npm-cross-link/compare/v6.1.0...v6.2.0) (2019-03-01)

### Features

- improve log message ([83734f1](https://github.com/medikoo/npm-cross-link/commit/83734f1))
- improve updateable version detection ([1a62756](https://github.com/medikoo/npm-cross-link/commit/1a62756))

# [6.1.0](https://github.com/medikoo/npm-cross-link/compare/v6.0.0...v6.1.0) (2019-02-28)

### Bug Fixes

- avoid EMFILE and ENFILE errors ([e0932bd](https://github.com/medikoo/npm-cross-link/commit/e0932bd))
- handling of broken package.json ([cdbce55](https://github.com/medikoo/npm-cross-link/commit/cdbce55))

### Features

- improve error message ([85f3fb6](https://github.com/medikoo/npm-cross-link/commit/85f3fb6))
- support username/reponame github repo notation ([6bc7f95](https://github.com/medikoo/npm-cross-link/commit/6bc7f95))

# [6.0.0](https://github.com/medikoo/npm-cross-link/compare/v5.1.0...v6.0.0) (2019-02-28)

### Bug Fixes

- do not proceed if `package.json` not found ([4b6db15](https://github.com/medikoo/npm-cross-link/commit/4b6db15))
- do not rewrite package.json on global install ([b29fca5](https://github.com/medikoo/npm-cross-link/commit/b29fca5))
- error propagation ([2faa83c](https://github.com/medikoo/npm-cross-link/commit/2faa83c))
- typo ([8484bd1](https://github.com/medikoo/npm-cross-link/commit/8484bd1))

### Features

- basic cache mechanism ([95cfc53](https://github.com/medikoo/npm-cross-link/commit/95cfc53))
- cache on spot installations ([0e74531](https://github.com/medikoo/npm-cross-link/commit/0e74531))
- cache only npm publications ([9317d63](https://github.com/medikoo/npm-cross-link/commit/9317d63))
- do not crash if package.json doesn't exist ([f7aa5dc](https://github.com/medikoo/npm-cross-link/commit/f7aa5dc))
- ensure to resolve correct versions from maintained deps ([733a3fe](https://github.com/medikoo/npm-cross-link/commit/733a3fe))
- handle git repo references efficiently ([29c7894](https://github.com/medikoo/npm-cross-link/commit/29c7894))
- handle non overridable externals properly ([f234351](https://github.com/medikoo/npm-cross-link/commit/f234351))
- if non semver range, always install in place ([1f6422e](https://github.com/medikoo/npm-cross-link/commit/1f6422e))
- improve CLI message ([24a6028](https://github.com/medikoo/npm-cross-link/commit/24a6028))
- improve error message ([f2f6608](https://github.com/medikoo/npm-cross-link/commit/f2f6608))
- improve external setup ([7b29664](https://github.com/medikoo/npm-cross-link/commit/7b29664))
- improve jobs logging ([1fe3566](https://github.com/medikoo/npm-cross-link/commit/1fe3566))
- improve log location ([5ea150a](https://github.com/medikoo/npm-cross-link/commit/5ea150a))
- improve logging ([3d986f0](https://github.com/medikoo/npm-cross-link/commit/3d986f0))
- improve logging ([528aa54](https://github.com/medikoo/npm-cross-link/commit/528aa54))
- improve package name validation ([ef7cb78](https://github.com/medikoo/npm-cross-link/commit/ef7cb78))
- install on spot for misversioned local ([2f4a827](https://github.com/medikoo/npm-cross-link/commit/2f4a827))
- on npm-cross-link <pkgName> install pkgNam as dep ([c720ec0](https://github.com/medikoo/npm-cross-link/commit/c720ec0))
- optimize further installation ([9fad7d7](https://github.com/medikoo/npm-cross-link/commit/9fad7d7))
- output log only when it makes sense ([289830c](https://github.com/medikoo/npm-cross-link/commit/289830c))
- proper location for new package.json section ([eea4e92](https://github.com/medikoo/npm-cross-link/commit/eea4e92))
- rely on etag caching ([82193f9](https://github.com/medikoo/npm-cross-link/commit/82193f9))
- speedup npm registry meta resolution ([f37b4e7](https://github.com/medikoo/npm-cross-link/commit/f37b4e7))
- support 'global' option ([d2368ae](https://github.com/medikoo/npm-cross-link/commit/d2368ae))
- support global installs of externals ([3be98f4](https://github.com/medikoo/npm-cross-link/commit/3be98f4))
- support saveMode option ([44a57ff](https://github.com/medikoo/npm-cross-link/commit/44a57ff))
- support specifying version in install-dependency ([f04aac2](https://github.com/medikoo/npm-cross-link/commit/f04aac2))
- update package.json dependencies sections ([6d90b83](https://github.com/medikoo/npm-cross-link/commit/6d90b83))
- write updated version in case of updateDependency ([3a67921](https://github.com/medikoo/npm-cross-link/commit/3a67921))

### BREAKING CHANGES

- Changed behavior of:
  \$ npm-cross-link <package-name>
  It now installs mentioned package as a dependency and does not ensure
  it's installed gobally
- If local installation exposes no version, while there's
  published version that matches version range
  install on spot
- Non semver referenced local installs are now installed
  on spot instead of being linked

# [5.1.0](https://github.com/medikoo/npm-cross-link/compare/v5.0.2...v5.1.0) (2019-02-19)

### Bug Fixes

- install of not published dependencies ([c8a379e](https://github.com/medikoo/npm-cross-link/commit/c8a379e))
- resolve correct registry url ([e8df91c](https://github.com/medikoo/npm-cross-link/commit/e8df91c))

### Features

- expose topPackageName on progressData ([ab2c468](https://github.com/medikoo/npm-cross-link/commit/ab2c468))
- improve error logging ([e6e1a21](https://github.com/medikoo/npm-cross-link/commit/e6e1a21))
- improve log levels choice ([7407bf4](https://github.com/medikoo/npm-cross-link/commit/7407bf4))
- improve log message ([8b2d935](https://github.com/medikoo/npm-cross-link/commit/8b2d935))
- improve log message ([f4c61da](https://github.com/medikoo/npm-cross-link/commit/f4c61da))
- improve log message ([a62b877](https://github.com/medikoo/npm-cross-link/commit/a62b877))
- log npm view output ([806ea63](https://github.com/medikoo/npm-cross-link/commit/806ea63))
- support npm registry authentication ([cbc9560](https://github.com/medikoo/npm-cross-link/commit/cbc9560))

<a name="5.0.2"></a>

## [5.0.2](https://github.com/medikoo/npm-cross-link/compare/v5.0.1...v5.0.2) (2019-02-04)

### Bug Fixes

- ensure to remove unexpected named dependencies ([7e4ef7b](https://github.com/medikoo/npm-cross-link/commit/7e4ef7b))
- improve external consistency detection ([b01dcac](https://github.com/medikoo/npm-cross-link/commit/b01dcac))

<a name="5.0.1"></a>

## [5.0.1](https://github.com/medikoo/npm-cross-link/compare/v5.0.0...v5.0.1) (2019-02-04)

### Bug Fixes

- remove accidental concurrency ([d062d9a](https://github.com/medikoo/npm-cross-link/commit/d062d9a))

<a name="5.0.0"></a>

# [5.0.0](https://github.com/medikoo/npm-cross-link/compare/v4.0.0...v5.0.0) (2019-01-31)

### Bug Fixes

- fix resolution of latest supported published version ([5123814](https://github.com/medikoo/npm-cross-link/commit/5123814))
- handling installation of externals at non semver versions ([d9f0f14](https://github.com/medikoo/npm-cross-link/commit/d9f0f14))
- handling of case where package has no dependencies ([6539fa4](https://github.com/medikoo/npm-cross-link/commit/6539fa4))

### Features

- ensure to remove package-lock.json for maintained packages ([dee49dd](https://github.com/medikoo/npm-cross-link/commit/dee49dd))

### BREAKING CHANGES

- package-lock.json is now automatically removed for link dependencies.
  As they serve as libraries, so package lock servse no purpose for them

<a name="4.0.0"></a>

# [4.0.0](https://github.com/medikoo/npm-cross-link/compare/v3.1.4...v4.0.0) (2019-01-21)

### Features

- install local deps in place if not at local version ([9fd6b4a](https://github.com/medikoo/npm-cross-link/commit/9fd6b4a))

### BREAKING CHANGES

- So far local (developed) dependencies where linked no matter the
  referenced version in package.json.
  Since now npm versions are installed in place
  if referenced version doesn't match local one.
  This ensures we should always have packages working
  and allow more controlled upgrades of majors

<a name="3.1.4"></a>

## [3.1.4](https://github.com/medikoo/npm-cross-link/compare/v3.1.3...v3.1.4) (2018-11-15)

### Bug Fixes

- fix git repository detection ([3ba4350](https://github.com/medikoo/npm-cross-link/commit/3ba4350))
- job name ([d270b16](https://github.com/medikoo/npm-cross-link/commit/d270b16))
- report unrecognized job ([b60765d](https://github.com/medikoo/npm-cross-link/commit/b60765d))

<a name="3.1.3"></a>

## [3.1.3](https://github.com/medikoo/npm-cross-link/compare/v3.1.2...v3.1.3) (2018-11-15)

<a name="3.1.2"></a>

## [3.1.2](https://github.com/medikoo/npm-cross-link/compare/v3.1.1...v3.1.2) (2018-11-15)

<a name="3.1.1"></a>

## [3.1.1](https://github.com/medikoo/npm-cross-link/compare/v3.1.0...v3.1.1) (2018-11-15)

### Bug Fixes

- ensure to report installed package in ongoing ([2e6c9f5](https://github.com/medikoo/npm-cross-link/commit/2e6c9f5))
- install of not maintained package ([9c87e88](https://github.com/medikoo/npm-cross-link/commit/9c87e88))
- windows support ([35d0f5e](https://github.com/medikoo/npm-cross-link/commit/35d0f5e))

<a name="3.1.0"></a>

# [3.1.0](https://github.com/medikoo/npm-cross-link/compare/v3.0.3...v3.1.0) (2018-11-15)

### Bug Fixes

- mention "link" job ([dcd0258](https://github.com/medikoo/npm-cross-link/commit/dcd0258))

### Features

- improve installation jobs reporting ([618b22f](https://github.com/medikoo/npm-cross-link/commit/618b22f))
- improve npm link step ([bb6a5ef](https://github.com/medikoo/npm-cross-link/commit/bb6a5ef))

<a name="3.0.3"></a>

## [3.0.3](https://github.com/medikoo/npm-cross-link/compare/v3.0.2...v3.0.3) (2018-11-15)

### Bug Fixes

- ensure to link before dependencies install ([c651bb7](https://github.com/medikoo/npm-cross-link/commit/c651bb7))

<a name="3.0.2"></a>

## [3.0.2](https://github.com/medikoo/npm-cross-link/compare/v3.0.1...v3.0.2) (2018-11-15)

### Bug Fixes

- fix NpmCrossLinkError constructor name ([bd57352](https://github.com/medikoo/npm-cross-link/commit/bd57352))
- fix progressData event so it reflects packageContext ([29c1bf7](https://github.com/medikoo/npm-cross-link/commit/29c1bf7))

<a name="3.0.1"></a>

## [3.0.1](https://github.com/medikoo/npm-cross-link/compare/v3.0.0...v3.0.1) (2018-11-14)

<a name="3.0.0"></a>

# [3.0.0](https://github.com/medikoo/npm-cross-link/compare/v2.0.0...v3.0.0) (2018-11-14)

### Bug Fixes

- confirm on satisfiable version range in any case ([886bf3b](https://github.com/medikoo/npm-cross-link/commit/886bf3b))
- do not apply hooks to not maintaned packages ([aad10e7](https://github.com/medikoo/npm-cross-link/commit/aad10e7))

### Features

- do not expose pending jobs on pacakgeContext ([18648cb](https://github.com/medikoo/npm-cross-link/commit/18648cb))
- expose list of installation jobs per package ([f2663c4](https://github.com/medikoo/npm-cross-link/commit/f2663c4))
- expose progressData on result instead of just events ([ebcc284](https://github.com/medikoo/npm-cross-link/commit/ebcc284))
- Improve install in context of maintained ([a2ea872](https://github.com/medikoo/npm-cross-link/commit/a2ea872))
- minimize after hooks registration ([9095239](https://github.com/medikoo/npm-cross-link/commit/9095239))
- pass progressData with event, expose type on it ([3c2f8c3](https://github.com/medikoo/npm-cross-link/commit/3c2f8c3))
- reconfigure into two binaries ([3abed15](https://github.com/medikoo/npm-cross-link/commit/3abed15))
- reconfigure pendingJobs as after hooks ([cdd1a01](https://github.com/medikoo/npm-cross-link/commit/cdd1a01))
- rename hooks into installationHooks ([66a8f14](https://github.com/medikoo/npm-cross-link/commit/66a8f14))
- rename progressData.externalsMap to progressData.externals ([45db94a](https://github.com/medikoo/npm-cross-link/commit/45db94a))
- rename progressData.ongoingMap into progressData.ongoing ([a795dfd](https://github.com/medikoo/npm-cross-link/commit/a795dfd))
- rename type into installationType ([3e8ea0d](https://github.com/medikoo/npm-cross-link/commit/3e8ea0d))
- report eventual "update" as "processing" ([5b491eb](https://github.com/medikoo/npm-cross-link/commit/5b491eb))
- reuse packageContext as packageProgressData ([49a1839](https://github.com/medikoo/npm-cross-link/commit/49a1839))
- send report from setupRepository ([7a3fde4](https://github.com/medikoo/npm-cross-link/commit/7a3fde4))
- turn progressData.done to map ([9dc1847](https://github.com/medikoo/npm-cross-link/commit/9dc1847))

### BREAKING CHANGES

- `$ npm-cross-link install` now is represented by `$ npm-cross-link`
  `$ npm-cross-link update-all` now is represented by
  `$ npm-cross-link-update-all`
- Events are no longer exposed on result promise(instead they're accessible on promise.progressData)
- progressDataEvent.type was moved to progressDataEvent.progressData.type
- progressData.done is now a map not a set
- Pending jobs are now exposed on hooks.after result of ongoing item
- pacakgeContext.pendingJobs was removed
- progressData.externalsMap was renamed to progressData.externals
- progressData.ongoingMap was renamed to progressData.ongoing
- setupRepository instead of boolean now returns set
  that states which operations were pursued

<a name="2.0.0"></a>

# [2.0.0](https://github.com/medikoo/npm-cross-link/compare/v1.1.1...v2.0.0) (2018-11-12)

### Features

- optionally pull changes from remote ([d7a297b](https://github.com/medikoo/npm-cross-link/commit/d7a297b))

### BREAKING CHANGES

- Changes from remote are now pulled optionally

<a name="1.1.1"></a>

## [1.1.1](https://github.com/medikoo/dev-package-install/compare/v1.1.0...v1.1.1) (2018-11-09)

<a name="1.1.0"></a>

# 1.1.0 (2018-11-09)

### Bug Fixes

- dependency setup ([6b7ed1d](https://github.com/medikoo/dev-package-install/commit/6b7ed1d))
- do not follow in case of not confirmed dev package ([c00f65b](https://github.com/medikoo/dev-package-install/commit/c00f65b))
- do not install on spot non semver install ([53c419f](https://github.com/medikoo/dev-package-install/commit/53c419f))
- ensure to clean progress on error exit ([51c75ed](https://github.com/medikoo/dev-package-install/commit/51c75ed))
- fix handling of optional dev packages ([1a2255e](https://github.com/medikoo/dev-package-install/commit/1a2255e))
- getPackageJson error handling ([67b0c41](https://github.com/medikoo/dev-package-install/commit/67b0c41))
- handling of optional dependencies ([39d8eb3](https://github.com/medikoo/dev-package-install/commit/39d8eb3))
- isValidSymlink handling ([9e7263e](https://github.com/medikoo/dev-package-install/commit/9e7263e))
- npm link setup ([0d775cf](https://github.com/medikoo/dev-package-install/commit/0d775cf))
- npm modules path ([4d49bf0](https://github.com/medikoo/dev-package-install/commit/4d49bf0))
- recognize `update` command in cli help ([d2be780](https://github.com/medikoo/dev-package-install/commit/d2be780))
- revert mistakenly commented out code ([4130c88](https://github.com/medikoo/dev-package-install/commit/4130c88))
- **cli:** --no-pull arg resolution ([e114c2e](https://github.com/medikoo/dev-package-install/commit/e114c2e))
- symlink path check ([95987c6](https://github.com/medikoo/dev-package-install/commit/95987c6))
- update meta after version upgrade ([8dbe1e9](https://github.com/medikoo/dev-package-install/commit/8dbe1e9))
- update of linked external dependency ([c9f250c](https://github.com/medikoo/dev-package-install/commit/c9f250c))

### Features

- cli progress ([559719a](https://github.com/medikoo/dev-package-install/commit/559719a))
- differentiate between install and update operation ([0823b9f](https://github.com/medikoo/dev-package-install/commit/0823b9f))
- drop singleton nature ([83766d6](https://github.com/medikoo/dev-package-install/commit/83766d6))
- enable git push option ([2e91ec7](https://github.com/medikoo/dev-package-install/commit/2e91ec7))
- ensure npm link error to be fully exposed ([a449389](https://github.com/medikoo/dev-package-install/commit/a449389))
- ensure npm link points package at path ([5a82732](https://github.com/medikoo/dev-package-install/commit/5a82732))
- ensure to cleanup after npm crash ([cec7167](https://github.com/medikoo/dev-package-install/commit/cec7167))
- ensure to link dependency if link is not rigth ([51ffd5b](https://github.com/medikoo/dev-package-install/commit/51ffd5b))
- general install command ([976b463](https://github.com/medikoo/dev-package-install/commit/976b463))
- handle gently no packageJson case ([8629a5d](https://github.com/medikoo/dev-package-install/commit/8629a5d))
- host user specific configuration externally ([9fee809](https://github.com/medikoo/dev-package-install/commit/9fee809))
- ignore npm error if link was created ([8e9377b](https://github.com/medikoo/dev-package-install/commit/8e9377b))
- improve error message ([0e5a7ac](https://github.com/medikoo/dev-package-install/commit/0e5a7ac))
- improve error reporting ([18da647](https://github.com/medikoo/dev-package-install/commit/18da647))
- improve log message ([9bdcaf6](https://github.com/medikoo/dev-package-install/commit/9bdcaf6))
- improve logging ([50d9e6c](https://github.com/medikoo/dev-package-install/commit/50d9e6c))
- improve logging ([92d83a2](https://github.com/medikoo/dev-package-install/commit/92d83a2))
- improve npm error handling ([ef30cdb](https://github.com/medikoo/dev-package-install/commit/ef30cdb))
- improve repo update logic ([ab1fc26](https://github.com/medikoo/dev-package-install/commit/ab1fc26))
- improve warning message ([d030445](https://github.com/medikoo/dev-package-install/commit/d030445))
- inform of install type ([c2bdf25](https://github.com/medikoo/dev-package-install/commit/c2bdf25))
- inform on whether repository was created ([ef7cde3](https://github.com/medikoo/dev-package-install/commit/ef7cde3))
- introduce non dependency cleanup step ([eab04e9](https://github.com/medikoo/dev-package-install/commit/eab04e9))
- log error in case linked version mismatch version range ([613919f](https://github.com/medikoo/dev-package-install/commit/613919f))
- make options optional ([15ae780](https://github.com/medikoo/dev-package-install/commit/15ae780))
- make setupRepository public ([e27e653](https://github.com/medikoo/dev-package-install/commit/e27e653))
- mark end after pending jobs are finalized ([79aba42](https://github.com/medikoo/dev-package-install/commit/79aba42))
- new approach for linking/installing externals ([a82d3c2](https://github.com/medikoo/dev-package-install/commit/a82d3c2))
- new version ([8471227](https://github.com/medikoo/dev-package-install/commit/8471227))
- pass options to hook ([c32a1fc](https://github.com/medikoo/dev-package-install/commit/c32a1fc))
- put logs at hidden level, expose emitter ([0eca533](https://github.com/medikoo/dev-package-install/commit/0eca533))
- remove support for mirror 'update' command ([8a917de](https://github.com/medikoo/dev-package-install/commit/8a917de))
- rename from dev-package to npm-cross-link ([bf537ed](https://github.com/medikoo/dev-package-install/commit/bf537ed))
- rename main module to installPackage ([33fb754](https://github.com/medikoo/dev-package-install/commit/33fb754))
- rename skipGitUpdate to disableGitPull ([4643f51](https://github.com/medikoo/dev-package-install/commit/4643f51))
- seclude getPackageJson ([d80d71a](https://github.com/medikoo/dev-package-install/commit/d80d71a))
- simplify CLI args ([3724d59](https://github.com/medikoo/dev-package-install/commit/3724d59))
- simplify option names ([4aff319](https://github.com/medikoo/dev-package-install/commit/4aff319))
- **bin:** commands support in binary ([bcdabb6](https://github.com/medikoo/dev-package-install/commit/bcdabb6))
- **cli:** improve usage message ([f28d614](https://github.com/medikoo/dev-package-install/commit/f28d614))
- simplify skipGitUpdate handling ([81007d9](https://github.com/medikoo/dev-package-install/commit/81007d9))
- solidify npm modules path resolution ([59cda84](https://github.com/medikoo/dev-package-install/commit/59cda84))
- support recovery from any npm link error ([e162fa1](https://github.com/medikoo/dev-package-install/commit/e162fa1))
- support skipNestedGitUpdate option ([7434735](https://github.com/medikoo/dev-package-install/commit/7434735))
- support update command ([039d372](https://github.com/medikoo/dev-package-install/commit/039d372))
- update-all command ([26364b7](https://github.com/medikoo/dev-package-install/commit/26364b7))
- upgrade external when higher version is discovered ([407b616](https://github.com/medikoo/dev-package-install/commit/407b616))

<a name="1.0.0"></a>

# 1.0.0 (2018-11-09)

### Bug Fixes

- dependency setup ([c722a3e](https://github.com/medikoo/dev-package-install/commit/c722a3e))
- do not follow in case of not confirmed dev package ([102de35](https://github.com/medikoo/dev-package-install/commit/102de35))
- do not install on spot non semver install ([3699ead](https://github.com/medikoo/dev-package-install/commit/3699ead))
- ensure to clean progress on error exit ([20d006c](https://github.com/medikoo/dev-package-install/commit/20d006c))
- fix handling of optional dev packages ([3e0674f](https://github.com/medikoo/dev-package-install/commit/3e0674f))
- getPackageJson error handling ([10ecb9a](https://github.com/medikoo/dev-package-install/commit/10ecb9a))
- handling of optional dependencies ([9b2b093](https://github.com/medikoo/dev-package-install/commit/9b2b093))
- isValidSymlink handling ([770a939](https://github.com/medikoo/dev-package-install/commit/770a939))
- npm link setup ([8a3044a](https://github.com/medikoo/dev-package-install/commit/8a3044a))
- npm modules path ([ccd2c78](https://github.com/medikoo/dev-package-install/commit/ccd2c78))
- recognize `update` command in cli help ([3239e84](https://github.com/medikoo/dev-package-install/commit/3239e84))
- revert mistakenly commented out code ([7458650](https://github.com/medikoo/dev-package-install/commit/7458650))
- **cli:** --no-pull arg resolution ([61cd13a](https://github.com/medikoo/dev-package-install/commit/61cd13a))
- symlink path check ([72b113a](https://github.com/medikoo/dev-package-install/commit/72b113a))
- update meta after version upgrade ([0e5fd56](https://github.com/medikoo/dev-package-install/commit/0e5fd56))
- update of linked external dependency ([fc0af8f](https://github.com/medikoo/dev-package-install/commit/fc0af8f))

### Features

- cli progress ([bfe041c](https://github.com/medikoo/dev-package-install/commit/bfe041c))
- differentiate between install and update operation ([d70afc8](https://github.com/medikoo/dev-package-install/commit/d70afc8))
- drop singleton nature ([a138b2e](https://github.com/medikoo/dev-package-install/commit/a138b2e))
- enable git push option ([08a7d11](https://github.com/medikoo/dev-package-install/commit/08a7d11))
- ensure npm link error to be fully exposed ([52e5137](https://github.com/medikoo/dev-package-install/commit/52e5137))
- ensure npm link points package at path ([f99b650](https://github.com/medikoo/dev-package-install/commit/f99b650))
- ensure to cleanup after npm crash ([6a84450](https://github.com/medikoo/dev-package-install/commit/6a84450))
- ensure to link dependency if link is not rigth ([796ce85](https://github.com/medikoo/dev-package-install/commit/796ce85))
- general install command ([b8dcbc1](https://github.com/medikoo/dev-package-install/commit/b8dcbc1))
- handle gently no packageJson case ([07a9adc](https://github.com/medikoo/dev-package-install/commit/07a9adc))
- host user specific configuration externally ([439abb1](https://github.com/medikoo/dev-package-install/commit/439abb1))
- ignore npm error if link was created ([c0dba47](https://github.com/medikoo/dev-package-install/commit/c0dba47))
- improve error message ([3ef6633](https://github.com/medikoo/dev-package-install/commit/3ef6633))
- improve error reporting ([05d6c6c](https://github.com/medikoo/dev-package-install/commit/05d6c6c))
- improve log message ([eb5acf0](https://github.com/medikoo/dev-package-install/commit/eb5acf0))
- improve logging ([2acf1c3](https://github.com/medikoo/dev-package-install/commit/2acf1c3))
- improve logging ([3b053f8](https://github.com/medikoo/dev-package-install/commit/3b053f8))
- improve npm error handling ([41f14a7](https://github.com/medikoo/dev-package-install/commit/41f14a7))
- improve repo update logic ([fca33a9](https://github.com/medikoo/dev-package-install/commit/fca33a9))
- improve warning message ([d63030c](https://github.com/medikoo/dev-package-install/commit/d63030c))
- inform of install type ([05a98ac](https://github.com/medikoo/dev-package-install/commit/05a98ac))
- inform on whether repository was created ([0602ab5](https://github.com/medikoo/dev-package-install/commit/0602ab5))
- introduce non dependency cleanup step ([51afdbc](https://github.com/medikoo/dev-package-install/commit/51afdbc))
- log error in case linked version mismatch version range ([df533f8](https://github.com/medikoo/dev-package-install/commit/df533f8))
- make options optional ([324d9da](https://github.com/medikoo/dev-package-install/commit/324d9da))
- make setupRepository public ([240dfea](https://github.com/medikoo/dev-package-install/commit/240dfea))
- mark end after pending jobs are finalized ([f492985](https://github.com/medikoo/dev-package-install/commit/f492985))
- new approach for linking/installing externals ([8eeef09](https://github.com/medikoo/dev-package-install/commit/8eeef09))
- new version ([40056aa](https://github.com/medikoo/dev-package-install/commit/40056aa))
- pass options to hook ([74503a4](https://github.com/medikoo/dev-package-install/commit/74503a4))
- put logs at hidden level, expose emitter ([a2b2d33](https://github.com/medikoo/dev-package-install/commit/a2b2d33))
- remove support for mirror 'update' command ([124ae32](https://github.com/medikoo/dev-package-install/commit/124ae32))
- rename main module to installPackage ([77e3b5e](https://github.com/medikoo/dev-package-install/commit/77e3b5e))
- rename skipGitUpdate to disableGitPull ([3aa6806](https://github.com/medikoo/dev-package-install/commit/3aa6806))
- seclude getPackageJson ([16e3126](https://github.com/medikoo/dev-package-install/commit/16e3126))
- simplify CLI args ([520d979](https://github.com/medikoo/dev-package-install/commit/520d979))
- simplify option names ([03b056a](https://github.com/medikoo/dev-package-install/commit/03b056a))
- **bin:** commands support in binary ([5117688](https://github.com/medikoo/dev-package-install/commit/5117688))
- **cli:** improve usage message ([2b7884d](https://github.com/medikoo/dev-package-install/commit/2b7884d))
- simplify skipGitUpdate handling ([0343807](https://github.com/medikoo/dev-package-install/commit/0343807))
- solidify npm modules path resolution ([9094fd5](https://github.com/medikoo/dev-package-install/commit/9094fd5))
- support recovery from any npm link error ([dd453d0](https://github.com/medikoo/dev-package-install/commit/dd453d0))
- support skipNestedGitUpdate option ([1fe3351](https://github.com/medikoo/dev-package-install/commit/1fe3351))
- support update command ([351a592](https://github.com/medikoo/dev-package-install/commit/351a592))
- update-all command ([39773c9](https://github.com/medikoo/dev-package-install/commit/39773c9))
- upgrade external when higher version is discovered ([4fe8591](https://github.com/medikoo/dev-package-install/commit/4fe8591))
