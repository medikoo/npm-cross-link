# dev-package

### Use case

You maintain many npm packages which depend on each other. When developing locally you prefer to have them setup as git repositories that have dependencies npm linked to their repositories.

_Maintaining such setup can be time taking, especially when setting this up after fresh system install or when revisiting machine not used for a longer while._

### How it works?

In folder where you group all the package repositories (by default `~/npm-packages`) it installs requested package.
Where install procedure consist of following steps:

#### 1. Ensure that package repository is cloned to package folder and that is up to date

If reposistory already exists and it's clean (`git status` doesn't report any changes), `git pull` is invoked.
If there's no repository, it is cloned into its folder.
If there is, but it's not clean, then install is aborted with an error

#### 2. Ensure package dependecies are properly installed and linked

If dependency is other package we maintain, whole dev package install procedure is pursued for it.
If dependency is external package, we ensure it's npm linked, and link it as dependency.

#### 3. Ensure that installed package is npm linked

If package is not npm linked already, it is linked.
