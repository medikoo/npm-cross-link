# dev-package

## Package cross linker for npm packages developer

### Use case

You maintain many npm packages which depend on each other. When developing locally you prefer to have them setup as git repositories that have dependencies npm linked to their repositories.

### How it works?

Within configuration you choose a folder (defaults to `~/npm-packages`) where maintained packages are placed, and predefine (at `packagesMeta`) a _package name_ to _repository url_ mappings of packages you maintain.

When running `dev-package install <package-name>` command following steps are pursued

1. If repository is not setup it is cloned intoto corresponding folder. Otherwise changes from remote are pulled (can be opt out via `--no-pull`), and optionally committed changes can be pushed (indicate such intent with `--push`)
2. All maintained project dependencies (also `devDependencies`) are install according to `dev-package install <package-name>` flow. Those not maintained (not found in `packagesMeta`) are npm linked to global npm folder if supported at latest version, otherwise they're installed on spot (but in a form so all its dependencies persist in a dependency folder)
3. Ensure that package is linked to global npm folder

All important events and findings are communicated via log.

#### npm resolution

When relying on npm, it relies on version as accessible via command line.

If you rely on global installation, than on every Node.js update same npm and global folder will be used.

However when relying on .nvm, different npm is used with every different Node.js version. That means on each Node.js version change and package reinstall packages are relinked to new npm global folder.

That's not harmful per se, but implies work you may not expect to be done.

It's good to rely on `.nvm` to test how this project works (as then we're safe non of globally npm installed packages are not touched).

### CLI

#### `dev-package install [...options] <package-name>`

Installs or updates indicated package (with its dependencies) at packages folder.
Note: This command doesn't interefere in any way with eventual project at current working directory.

##### Supported options:

-   `--no-pull`: By default for all updated packages mising updates are pulled from remoted. Passing this in truns that off
-   `--push`: For all updated packages push committed changes to remote

#### `dev-package install [...options]`

Installs and links all maintained dependencies of a project (found at current working directory).
Installation rules are same as for package install. Maintained packages are linked, not maintained are linked to global npm folder, unless they do not refer to latest version then they're installed on spot (but with dependencies isolated to own directories)

Supports same options as `dev-package install`

#### `dev-package update-all [...options]

Updates all already installed packages.
Note: This command doesn't interefere in any way with eventual project at current working directory.

Supports same options as `dev-package install`

### Configuration

User configuraiton module is madndatory and is expected to be placed at `~/.dev-package` path.

It is expected to resolve (asynchrounus resolution is supported) a configiuration object with following properties:

#### `packagesPath`

Optional, defaults to `~/npm-packages`. Folder at which maintained packages should be placed

#### `packagesMeta`

Meta data of each maintained package. At this point just `repoUrl` is supported. Example form:

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

Optional. List of eventual hools

##### `hooks.afterPackageInstall`

Optional, additional operation that should be done after successful maintained package installation (it's not run for other packages to be eventually npm linked or installed on spot).

Function is run with following arguments:

-   `packageContext` - All needed information about package that was installed
-   `userConfiguration` - User configuration as resolved and normalized from `~/.dev-package`
-   `inputOptions` - CLI command options

#### `userDependencies`

Optional. Eventual list of package names that should not be cleaned up from package `node_modules` folder.

Installer by default removes all dependencies not referenced in `package.json`, this ensures that if we install something externally or via `afterPackageInstall` hook, it remains untouched
