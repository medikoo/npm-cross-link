"use strict";

const meta = require("../../../package");

module.exports = {
	"main": `dev-package v${ meta.version }

Usage: dev-package [-h | --help] <command> [<args>]

where <command> is one of:
    install

dev-package <command> -h  quick help on <command>

Options:

    --help,            -h  Show this message

`,
	"install": `dev-package v${ meta.version }

Usage: dev-package install [-h | --help] [--disable-git-pull] [--enable-git-push] [<package-name>]

When <package-name> is provided, it is ensured it's installed and is up to date,
as located in npm packages folder
(there are no updates made to eventual project at current working directory)

When <package-name> is not provided then all dependencies of a project at
current working directory are ensured to be linked or installed
up to dev-package installation rules

Options:

    --disable-git-pull     Do not pull changes from remote
    --enable-git-push      Push committed changes to remote
    --help,            -h  Show this message

`,
	"update-all": `dev-package v${ meta.version }

Usage: dev-package update-all [-h | --help] [--disable-git-pull] [--enable-git-push]

Ensures all packages in npm packages folder are properly installed and up to date

Options:

    --disable-git-pull     Do not pull changes from remote
    --enable-git-push      Push committed changes to remote
    --help,            -h  Show this message

`
};
