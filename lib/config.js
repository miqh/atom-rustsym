'use babel';

class Config {

  constructor() {
    let symbolsViewLoaded = atom.packages.isPackageLoaded('symbols-view');
    this.schema = {
      overrideCommands: {
        default: symbolsViewLoaded,
        description:
          `Makes the symbol views provided by this package take precedence over
          any existing providers for Rust source files.\n\nIf this option is
          enabled, please ensure that the command names specified below for
          toggling symbols are consistent with the commands of an existing
          symbols provider. Note that this setting is not needed if you choose
          to set up key mappings using the command names specific to this package.`,
        order: 0,
        type: 'boolean'
      },
      toggleFileSymbolsCommand: {
        default: 'symbols-view:toggle-file-symbols',
        description:
          `The command name used by another symbols view provider to
          toggle the display of file symbols. Only relevant if the
          **Override Commands** setting is enabled.`,
        order: 1,
        type: 'string'
      },
      toggleProjectSymbolsCommand: {
        default: 'symbols-view:toggle-project-symbols',
        description:
          `The command name used by another symbols view provider to
          toggle the display of project symbols. Only relevant if the
          **Override Commands** setting is enabled.`,
        order: 2,
        type: 'string'
      }
    };
  }

  getToggleFileSymbolsCommand() {
    // Configuration returns `undefined` instead of the placeholder default
    return atom.config.get('rustsym.toggleFileSymbolsCommand') ||
           this.schema.toggleFileSymbolsCommand.default;
  }

  getToggleProjectSymbolsCommand() {
    // Configuration returns `undefined` instead of the placeholder default
    return atom.config.get('rustsym.toggleProjectSymbolsCommand') ||
           this.schema.toggleProjectSymbolsCommand.default;
  }

  watchOverrideCommands(callback) {
    return atom.config.observe('rustsym.overrideCommands', callback);
  }

}

export default new Config();
