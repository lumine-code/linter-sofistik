# linter-sofistik

Display SOFiSTiK compilation errors as linter messages.

> [!WARNING]
> **This package is deprecated.** SOFiSTiK diagnostics and calculation-log import are now provided by [ide-sofistik](https://github.com/lumine-code/ide-sofistik) through [ide-client](https://github.com/lumine-code/ide-client) and [linter](https://github.com/lumine-code/linter). This repository is archived and no longer maintained.

Reads error messages from SOFiSTiK output and shows them using the linter interface.

> **NOTE**: This package is not an official SOFiSTiK product and is not affiliated with or endorsed by SOFiSTiK AG.

## Features

- **Module validation**: validates `PROG` module names on the fly against the release and language selected by `sofistik-environment`.
- **Error display**: shows SOFiSTiK compilation errors from `.error_positions` files with the linter UI.
- **Manual trigger**: run compilation-error linting on demand and jump to the first error.

## Migration

Disable or uninstall `linter-sofistik` and install `ide-sofistik` with `ide-client`. Keep `linter` installed to display diagnostics.

```sh
lumine --install lumine-code/ide-client
lumine --install lumine-code/ide-sofistik
lumine --install lumine-code/linter
```

Use `ide-sofistik:read-calculation-diagnostics` on a saved, unchanged source file to import its existing `.error_positions` log.

## Commands

Commands available in `lumine-text-editor[data-grammar="source sofistik"]`:

- `linter-sofistik:lint`: parse the `.error_positions` file next to the current file and display its messages.

## Services

- `linter.provider`: provided to the linter package; exposes the SOFiSTiK module-name linter with its name, grammar scopes and `lint` function.
- `linter.registry`: consumed to report compilation errors parsed from `.error_positions` files.
- `sofistik.environment`: consumed to obtain the valid module names for the release and language selected for a file.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
