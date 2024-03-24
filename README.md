[![Build status][build-image]][build-url]
[![npm version][npm-image]][npm-url]

# npm-cross-link

## Automate `npm link` across maintained packages and projects

```sh
npm install -g npm-cross-link
```

### Use case

You maintain many distinct npm packages and prefer to cross link them across each other, handling such setup manually can be time taking and error-prone.

`npm-cross-link` is packages installer which installs dependencies into `node_modules` the following way:

- Dependencies which expect to rely on some peer dependencies, are placed directly in `node_modules`
- All other dependencies are linked:
  - Maintained dependencies referenced by _latest_ versions are linked to its corresponding repository folders
  - All others are installed once in dedicated cache folder, and are linked into that folder

### How it works?

Within [configuration](#configuration) you choose a folder (defaults to `~/npm-packages`) where maintained packages are placed, and predefine (at `packagesMeta`) a _package name_ to _repository url_ mappings of packages you maintain.

When running `npm-cross-link -g <package-name>` for maintained package, or when installing a maintained package as a dependency, following steps are pursued:

1. If package repository is not setup, it is cloned into corresponding folder (`~/npm-packages/<package-name>` by default). Otherwise optionally new changes from remote can be pulled (`--pull`) and committed changes pushed (`--push`)
2. All maintained project dependencies (also `devDependencies` and eventual `optionalDependencies`) are installed/updated according to same flow.

   - Not maintained dependencies (not found in `packagesMeta`) are ensured to be installed in cache and linked (unless they depend on some peer dependencies, then they're copied directly into `node_modules`)
   - Maintained project dependencies (those found in `packagesMeta`) if referenced version matches local, are simply cross linked, otherwise they're linked from cache folder

All important events and findings are communicated via logs (level of output can be fine tuned via [LOG_LEVEL](https://github.com/medikoo/log/#log_level) env setting).

As each dependency is installed individually (and maintained packages are being installed recursively), the first install may appear slower from regular`npm` or `yarn` installs. Still it doesn't affect all further installs.

#### npm resolution

Internally `npm-cross-link` relies on `npm` being accesible to prepare cached versions of installed packages.

#### Limitations

All subdependencies of project dependencies are installed within dependencies `node_modules` folders. It means that if e.g. dependency `A` and dependency `B`, depend on same version of dependency `C`, (and they're not maintained packages, so they're either linked to cache or installed on spot) they will use different installations of `C`.

npm since early days ensured that in such scenarios `C` is installed top level (so it's shared among `A` and `B`), npm-cross-link doesn't ensure that.

This shouldn't be a problem for most of packages. Still there are some packages for which having duplicate instances in environment may turn breaking or come with side effects, and as there's no practice being promoted to handle such scenarios, it's rare for those packages to come with any recovery logic.

### CLI

#### `npm-cross-link [...options]` (in package dir)

Installs or updates all project dependencies.

#### `npm-cross-link [...options] ...[<@scope>/]<name>[@<version range>]` (in package dir)

Installs or updates given project dependencies. If dependency version is not specified then one from `package.json` or _latest_ is assumed.

#### `npm-cross-link -g [...options] ...[<@scope>/]<name>`

Installs or updates given packages on its own. If it's maintained package, then it's ensured in resolved maintained folder, in all other cases packages is simply ensured to be installed in cache

#### `npm-cross-link-update-all [...options]`

Updates all are already installed maintained packages

##### General options:

- `--pull` - Pull eventual new updates from remote
- `--push` - For all updated packages push eventually committed changes to remote
- `--bump-deps` - (only non-global installations) Bump version ranges of dependencies in `package.json`
- `--no-save` - (only for dependencies install) Do not save dependency to `package.json` (effective only if its not there yet)
- `--dev` - (only for dependencies install) Force to store updated version in `devDependencies` section
- `--optional` - (only for dependencies install) Force to store updated version in `optionalDependencies` section
- `--prod` - (only for dependencies install) Force to store updated version in `dependencies` section

### Configuration

User configuration is mandatory and is expected to be placed at `~/.npm-cross-link` path.

_(Example of working configuration can be found at: [medikoo/.npm-cross-link](https://github.com/medikoo/.npm-cross-link/))_

It's expected to be a typical Node.js module, that exposes (asynchronously if needed) a configuration object with following properties:

#### `packagesPath`

Optional (defaults to `~/npm-packages`). Folder at which maintained packages should be placed

#### `packagesMeta`

Required. Meta data of each maintained package. Example form:

```json
{
  "packagesMeta": {
    "es6-symbol": { "repoUrl": "git@github.com:medikoo/es6-symbol.git" },
    "memoizee": { "repoUrl": "git@github.com:medikoo/memoizee.git" }
  }
}
```

Supported package meta properties:

##### `repoUrl` (required for packages maintained in its dedicated repositories)

URL to git repository

##### `branch`

If package is maintaned not at `main` branch, provide branch name

##### `multiPackageRepoName` (required for packages maintained in multi package repositories)

Name of mutli package repository, that this package is part of.

##### `path` (required ffor packages maintained in multi package repositories)

If used together with `multiRepoName`, then relative path in context of this repository.

Otherwise, can be set to customize package location (when relying on default `${packagesPath}/${package.name}` is not intended for some reason)

#### `multiPackageReposMeta`

Meta data of eventual multi package repositories referenced in `packagesMeta`.

Both `repoUrl` and `path` are mandatory

```json
{
  "multiPackageReposMeta": {
    "multiRepoName": {
      "repoUrl": "git@github.com:medikoo/multi-repo.git",
      "path": "/Users/foo/multi-repos/multi-repoName"
    }
  }
}
```

Additionally `branch` can be set, if it's not `master` branch that should be treated as default

#### `hooks`

Optional. List of eventual hooks

##### `hooks.afterPackageInstall`

Additional operation that should be done after successful package installation (it's run only for maintained packages).

Function is run with following arguments:

- `packageContext` - All needed information about package that was just installed or updated
- `userConfiguration` - User configuration as resolved and normalized from `~/.npm-cross-link`
- `inputOptions` - CLI command options

#### `userDependencies`

Optional. Eventual list of extra (not listed in `package.json`) packages that should not be cleaned up from package `node_modules` folder.

Installer by default removes all dependencies not referenced in package `package.json`. Throught this option we may ensure that if we install something externally or via `afterPackageInstall` hook, it remains untouched.

[transpilation-image]: https://img.shields.io/badge/transpilation-free-brightgreen.svg
[npm-image]: https://img.shields.io/npm/v/npm-cross-link.svg
[npm-url]: https://www.npmjs.com/package/npm-cross-link

#### `toBeCopiedDependencies`

Optional. Eventual list of non maintained dependencies that in all cases should be copied into `node_modules` and not linked to cache

[build-image]: https://github.com/medikoo/npm-cross-link/workflows/Integrate/badge.svg
[build-url]: https://github.com/medikoo/npm-cross-link/actions?query=workflow%3AIntegrate
[npm-image]: https://img.shields.io/npm/v/npm-cross-link.svg
[npm-url]: https://www.npmjs.com/package/npm-cross-link
