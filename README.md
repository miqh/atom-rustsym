# rustsym

[![apm][apm-badge]][apm]
[![ci][ci-badge]][ci]

An [Atom][] package that provides symbol navigation for [Rust][] code using
[`rustsym`][].

## Configuration

This package is designed to coexist with other Atom packages that offer a
symbols provider for source code.

Standard installations of Atom should come with the [`symbols-view`][] package
by default. As such, the default settings used by this package have been chosen
in order to avoid extra configuration for compatibility with `symbols-view`.

The _Override Commands_ setting is necessary for letting this package become
the symbols provider for Rust source code in the presence of other providers
in the Atom environment. With the setting enabled, commands for showing file
or project symbols will instead be delegated to this package.

If you are not using `symbols-view`, then you will need to set the command
names for toggling file or project symbols so that this package can intercept
the right commands and be triggered.

### Package Commands

In the event you do not wish to use the same key bindings as your preferred
symbols provider to trigger this package, the following commands are available
for setting manual key bindings.

- `rustsym:toggle-file-symbols`
- `rustsym:toggle-project-symbols`

Note that the _Override Commands_ setting is unnecessary if you choose to
create key bindings for the commands just above.

## Usage

Simply press the key combination for toggling file or project symbols to bring
to focus a search panel. As you enter search terms to locate your symbol of
interest, `rustsym` will run in the background and return a list of results.
Use the <kbd>↑</kbd> and <kbd>↓</kbd> keys to scroll through the results and
then press <kbd>ENTER</kbd> to navigate to the symbol currently highlighted.
Alternatively, you can also click on a symbol for navigation.

## Contributing

Please open up a new issue for any bug reports or requests, providing as much
detail as possible. 

[`rustsym`]: https://github.com/trixnz/rustsym
[`symbols-view`]: https://atom.io/packages/symbols-view
[apm]: https://atom.io/packages/rustsym
[apm-badge]: https://img.shields.io/apm/v/rustsym.svg?style=flat-square
[atom]: https://atom.io
[ci]: https://travis-ci.org/miqid/atom-rustsym
[ci-badge]: https://img.shields.io/travis/miqid/atom-rustsym/master.svg?style=flat-square
[rust]: https://www.rust-lang.org
