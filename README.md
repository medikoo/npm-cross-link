![Transpilation status][transpilation-image]
[![npm version][npm-image]][npm-url]

# npm-cross-link

## npm packages cross linker (an installer for packages developer)

```sh
npm install -g npm-cross-link
```

### Use case

You maintain many npm packages which depend on each other. When developing locally you prefer to have them setup as git repositories that have dependencies npm linked to their repositories.

### How it works?

Within [configuration](#configuration) you choose a folder (defaults to `~/npm-packages`) where maintained packages are placed, and predefine (at `packagesMeta`) a _package name_ to _repository url_ mappings of packages you maintain.

When running `npm-cross-link <package-name>` following steps are pursued:

1. If repository is not setup, it is cloned into corresponding folder. Otherwise optionally new changes from remote can be pulled (`--pull`) and committed changes pushed (`--push`)
2. All maintained project dependencies (also `devDependencies` and eventual `optionalDependencies`) are installed according to same flow.

    - Not maintained dependencies (not found in `packagesMeta`) if at latest version are ensured to be installed globally and npm linked to global npm folder. Otherwise they're installed on spot but with its dependencies contained in dependency folder (not top level node_modules).
    - Maintained project dependencies (those found in `packagesMeta`) if referenced version matches local, are simply cross linked linked, otherwise they're istalled on spot (with its dependencies contained in dependency folder, not top level node_modules).

3. Package is ensured to be linked to global npm folder

All important events and findings are communicated via logs (level of output can be fine tuned via [LOG_LEVEL](https://github.com/medikoo/log/#log_level) env setting)

#### npm resolution

When relying on npm, it relies on version as accessible via command line.

If you rely on global Node.js installation, then Node.js update doesn't change location of global npm folder, so updates to Node.js are free from side effects when package links are concerned.

However when relying on [nvm](https://github.com/creationix/nvm), different npm is used with every different Node.js version, which means each Node.js/npm version points to other npm global folder. That's not harmful per se, but on reinstallation all links would be updated to reflect new path.

To avoid confusion it's better to rely on global installation. Still [nvm](https://github.com/creationix/nvm) is great for checking this project out (as then globally installed packages are not affected).

### CLI

#### `npm-cross-link [...options] <package-name>`

Installs or updates indicated package (with its dependencies) at packages folder.

_Note: This command doesn't interfere in any way with eventual project at current working directory._

##### Supported options:

-   `--pull` - Pull eventual new updates from remote
-   `--push` - For all updated packages push eventually committed changes to remote

#### `npm-cross-link [...options]`

Installs and links all maintained dependencies of a project found at current working directory.  
Installation rules are same as for package install. Maintained packages are linked to its location, not maintained are linked to global npm folder (unless they do not refer to latest version, as then they're installed on spot)

Supports same options as `npm-cross-link`

#### `npm-cross-link-update-all [...options]`

Updates all packages that are already installed at packages folder.

_Note: This command doesn't interfere in any way with eventual project at current working directory._

Supports same options as `npm-cross-link`

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
		"es6-symbol": {
			"repoUrl": "git@github.com:medikoo/es6-symbol.git"
		},
		"memoizee": {
			"repoUrl": "git@github.com:medikoo/memoizee.git"
		}
	}
}
```

#### `hooks`

Optional. List of eventual hooks

##### `hooks.afterPackageInstall`

Additional operation that should be done after successful package installation (it's run only for maintained packages).

Function is run with following arguments:

-   `packageContext` - All needed information about package that was just installed or updated
-   `userConfiguration` - User configuration as resolved and normalized from `~/.npm-cross-link`
-   `inputOptions` - CLI command options

#### `userDependencies`

Optional. Eventual list of extra (not listed in `package.json`) packages that should not be cleaned up from package `node_modules` folder.

Installer by default removes all dependencies not referenced in package `package.json`. Throught this option we may ensure that if we install something externally or via `afterPackageInstall` hook, it remains untouched.

[transpilation-image]: https://img.shields.io/badge/transpilation-free-brightgreen.svg
[npm-image]: https://img.shields.io/npm/v/npm-cross-link.svg
[npm-url]: https://www.npmjs.com/package/npm-cross-link
