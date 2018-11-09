# dev-package

## npm packages cross linker (an installer for packages developer)

### Use case

You maintain many npm packages which depend on each other. When developing locally you prefer to have them setup as git repositories that have dependencies npm linked to their repositories.

### How it works?

Within [configuration](#configuration) you choose a folder (defaults to `~/npm-packages`) where maintained packages are placed, and predefine (at `packagesMeta`) a _package name_ to _repository url_ mappings of packages you maintain.

When running `dev-package install <package-name>` command following steps are pursued:

1. If repository is not setup it is cloned into corresponding folder. Otherwise changes from remote are pulled (can be opt out via `--no-pull`), and optionally committed changes can be pushed (indicate such intent with `--push`)
2. All maintained project dependencies (also `devDependencies`) are installed according to same flow. Those not maintained (not found in `packagesMeta`) are npm linked to global npm folder if supported at latest version, otherwise they're installed on spot (but in a form where all its dependencies persist in a dependency folder)
3. Package is ensured to be linked to global npm folder

All important events and findings are communicated via logs (level of output can be fine tuned via [LOG_LEVEL](https://github.com/medikoo/log4/#log_level) env setting)

#### npm resolution

When relying on npm, it relies on version as accessible via command line.

If you rely on global Node.js installation, then Node.js update doesn't change location of global npm folder, so updates to it are free from effects.

However when relying on [nvm](https://github.com/creationix/nvm), different npm is used with every different Node.js version, which means each Node.js/npm version points to other npm global folder. That's not harmful per se, but on reinstallation all links would be updated to reflect new path (which may be action you may not expect)

To avoid confusion it's better to rely on global installatio, still [nvm](https://github.com/creationix/nvm) is great for checking this project out (as then non of globally npm installed packages are touched).

### CLI

#### `dev-package install [...options] <package-name>`

Installs or updates indicated package (with its dependencies) at packages folder.  
_Note: This command doesn't interefere in any way with eventual project at current working directory._

##### Supported options:

-   `--no-pull` - By default (for all updated packages) mising updates are pulled from remote. This option turns that off
-   `--push` - For all updated packages push eventually committed changes to remote

#### `dev-package install [...options]`

Installs and links all maintained dependencies of a project (found at current working directory).  
Installation rules are same as for package install. Maintained packages are linked to its location, not maintained are linked to global npm folder (unless they do not refer to latest version, as then they're installed on spot)

Supports same options as `dev-package install`

#### `dev-package update-all [...options]

Updates all already installed packages.  
_Note: This command doesn't interefere in any way with eventual project at current working directory._

Supports same options as `dev-package install`

### Configuration

User configuraiton is mandatory and is expected to be placed at `~/.dev-package` path.

It's expected to be a typical Node.js module, that exposes (asynchrounus resolution is supported) a configuration object with following properties:

#### `packagesPath`

Optional (defaults to `~/npm-packages`). Folder at which maintained packages should be placed

#### `packagesMeta`

Required. Meta data of each maintained package. At this point just `repoUrl` is supported. Example form:

```json
{
	"packagesMeta": {
		"es6-symbol": {
			"repoUrl": "git@github.com:eslint/es6-symbol.git"
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

Additional operation that should be done after successful maintained package installation (it's not run for other packages to be eventually npm linked to global folder or installed on spot).

Function is run with following arguments:

-   `packageContext` - All needed information about package that was just installed or updated
-   `userConfiguration` - User configuration as resolved and normalized from `~/.dev-package`
-   `inputOptions` - CLI command options

#### `userDependencies`

Optional. Eventual list of package names that should not be cleaned up from package `node_modules` folder.

Installer by default removes all dependencies not referenced in package `package.json`. Throught his option we may ensure that if we install something externally or via `afterPackageInstall` hook, it remains untouched
