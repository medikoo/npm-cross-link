![Transpilation status][transpilation-image]
[![npm version][npm-image]][npm-url]

# npm-cross-link

## Automate `npm link` across maintained packages and projects

```sh
npm install -g npm-cross-link
```

### Use case

You maintain many npm packages and prefer to cross install them via `npm link`, handling such setup manually can be time taking and error-prone.

`npm-cross-link` is the npm installer that ensures all latest versions of dependencies are linked to global folder
and non latest are installed on spot (but with its deep dependencies located in its own `node_modules`)

For maintained packages, it ensures its local installation is linked into global folder

### How it works?

Within [configuration](#configuration) you choose a folder (defaults to `~/npm-packages`) where maintained packages are placed, and predefine (at `packagesMeta`) a _package name_ to _repository url_ mappings of packages you maintain.

When running `npm-cross-link -g <package-name>` for maintained package, or when installing a maintained package as a dependency, following steps are pursued:

1. If package repository is not setup, it is cloned into corresponding folder (`~/npm-packages/<package-name>` by default). Otherwise optionally new changes from remote can be pulled (`--pull`) and committed changes pushed (`--push`)
2. All maintained project dependencies (also `devDependencies` and eventual `optionalDependencies`) are installed/updated according to same flow.

   - Not maintained dependencies (not found in `packagesMeta`) if at latest version are ensured to be installed globally and npm linked to global npm folder. Otherwise they're installed on spot but with its dependencies contained in dependency folder (not top level node_modules).
   - Maintained project dependencies (those found in `packagesMeta`) if referenced version matches local, are simply cross linked, otherwise they're istalled on spot (with its dependencies contained in dependency folder, not top level node_modules).

3. Package is ensured to be linked to global npm folder

All important events and findings are communicated via logs (level of output can be fine tuned via [LOG_LEVEL](https://github.com/medikoo/log/#log_level) env setting).

As each dependency is installed individually (and maintained packages are being installed recursively), the first install may appear slower from regular`npm` or `yarn` installs. Still it doesn't affect all further installs.

#### npm resolution

When relying on npm, it relies on version as accessible via command line.

If you rely on global Node.js installation, then Node.js update doesn't change location of global npm folder, so updates to Node.js are free from side effects when package links are concerned.

However when relying on [nvm](https://github.com/creationix/nvm), different npm is used with every different Node.js version, which means each Node.js/npm version points to other npm global folder. That's not harmful per se, but on reinstallation all links would be updated to reflect new path.

To avoid confusion it's better to rely on global installation. Still [nvm](https://github.com/creationix/nvm) is great for checking this project out (as then globally installed packages are not affected).

#### Limitations

All subdependencies of project dependencies are installed within dependencies `node_modules` folders. It means that if e.g. dependency `A` and dependency `B`, depend on same version of dependency `C`, (and they're not maintained packages, so they're either linked to global installation or installed on spot) they will use different installations of `C`.

npm since early days ensured that in such scenarios `C` is installed top level (so it's shared among `A` and `B`), npm-cross-link doesn't ensure that.

This shouldn't be a problem for most of packages. Still there are some packages for which having duplicate instances in environment may turn breaking or come with side effects, and as there's no practice being promoted to handle such scenarios, it's rare for those packages to come with any recovery logic.

### CLI

#### `npm-cross-link [...options]` (in package dir)

Installs or updates all project dependencies.

#### `npm-cross-link [...options] ...[<@scope>/]<name>[@<version range>]` (in package dir)

Installs or updates given project dependencies. If dependency version is not specified then one from `package.json` or _latest_ is assumed.

#### `npm-cross-link -g [...options] ...[<@scope>/]<name>`

Installs or updates given packages globally. Due to `npm-cross-link` installation rules it's only latest versions of packages that are globally linked.

#### `npm-cross-link-update-all [...options]`

Updates all are already installed maintained packages

##### General options:

- `--pull` - Pull eventual new updates from remote
- `--push` - For all updated packages push eventually committed changes to remote
- `--bump-deps` - (only non global installations) Bump version ranges of dependencies in `package.json`
- `--no-save` - (only for dependencies install) Do not save dependency to `package.json` (effective only if its not there yet)
- `--save-dev` - (only for dependencies install) Force to store updated version in `devDependencies` section
- `--save-optional` - (only for dependencies install) Force to store updated version in `optionalDependencies` section
- `--save-prod` - (only for dependencies install) Force to store updated version in `dependencies` section

### Configuration

User configuration is mandatory and is expected to be placed at `~/.npm-cross-link` path.

_(Example of working configuration can be found at: [medikoo/.npm-cross-link](https://github.com/medikoo/.npm-cross-link/))_

It's expected to be a typical Node.js module, that exposes (asynchronously if needed) a configuration object with following properties:

#### `packagesPath`

Optional (defaults to `~/npm-packages`). Folder at which maintained packages should be placed

#### `packagesMeta`

Required. Meta data of each maintained package. At this point just `repoUrl` is supported. Example form:

```json
{
  "packagesMeta": {
    "es6-symbol": { "repoUrl": "git@github.com:medikoo/es6-symbol.git" },
    "memoizee": { "repoUrl": "git@github.com:medikoo/memoizee.git" }
  }
}
```

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
