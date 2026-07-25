# linter-sofistik

Display SOFiSTiK compilation errors. Reads error messages from SOFiSTiK output and shows them using the linter interface.

## Features

- **Module validation**: validates `PROG` module names on the fly against the keywords provided by `language-sofistik`.
- **Error display**: shows SOFiSTiK compilation errors from `.error_positions` files with the linter UI.
- **Manual trigger**: run compilation-error linting on demand and jump to the first error.

## Installation

To install `linter-sofistik` search for _linter-sofistik_ in the Install pane of the Lumine settings or run `lumine --install lumine-code/linter-sofistik`.

This package requires [language-sofistik](https://github.com/lumine-code/language-sofistik).

## Commands

Commands available in `atom-text-editor[data-grammar="source sofistik"]`:

- `linter-sofistik:lint`: parse the `.error_positions` file next to the current file and display its messages.

## Services

- **linter** (`1.0.0`): provided to the linter package; exposes the SOFiSTiK module-name linter with its name, grammar scopes and `lint` function.
- **linter-indie** (`^1.0.0`): consumed to report compilation errors parsed from `.error_positions` files.
- **sofistik.keywords** (`^1.0.0`): consumed to resolve the valid SOFiSTiK module names for validation.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
