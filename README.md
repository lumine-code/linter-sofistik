# linter-sofistik

Display SOFiSTiK compilation errors as linter messages.

Reads error messages from SOFiSTiK output and shows them using the linter interface.

> **NOTE**: This package is not an official SOFiSTiK product and is not affiliated with or endorsed by SOFiSTiK AG.

## Features

- **Module validation**: validates `PROG` module names on the fly against the keywords provided by `language-sofistik`.
- **Error display**: shows SOFiSTiK compilation errors from `.error_positions` files with the linter UI.
- **Manual trigger**: run compilation-error linting on demand and jump to the first error.

## Installation

To install `linter-sofistik` search for it in the Install pane of the Lumine settings, or run the command `lumine --install lumine-code/linter-sofistik`.

## Commands

Commands available in `lumine-text-editor[data-grammar="source sofistik"]`:

- `linter-sofistik:lint`: parse the `.error_positions` file next to the current file and display its messages.

## Services

- `linter.provider`: provided to the linter package; exposes the SOFiSTiK module-name linter with its name, grammar scopes and `lint` function.
- `linter.registry`: consumed to report compilation errors parsed from `.error_positions` files.
- `sofistik.keywords`: consumed to read the valid SOFiSTiK module names for validation.
- `sofistik.environment`: consumed to resolve which release a file is for, since a module name is only unknown relative to one.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
