'use babel';

class Config {

  constructor() {
    let symbolsViewLoaded = atom.packages.isPackageLoaded('symbols-view');
    this.schema = {
      executablePath: {
        default: '',
        description:
          `The absolute path to the \`rustsym\` executable on your
          system.\n\nOnly required if the executable is not already accessible
          through \`PATH\`.`,
        order: 0,
        type: 'string'
      },
      searchDebounceTime: {
        default: 500,
        description:
          `Affects the delay (in milliseconds) between entering symbol search
          terms and when the search is executed.`,
        minimum: 0,
        order: 1,
        type: 'integer'
      },
      overrideCommands: {
        default: symbolsViewLoaded,
        description:
          `Makes the symbol views provided by this package take precedence over
          any existing providers for Rust source files.\n\nIf this option is
          enabled, please ensure that the command names specified below for
          toggling symbols are consistent with the commands of an existing
          symbols provider. Note that this setting is not needed if you choose
          to set up key mappings using the command names specific to this package.`,
        order: 2,
        type: 'boolean'
      },
      toggleFileSymbolsCommand: {
        default: 'symbols-view:toggle-file-symbols',
        description:
          `The command name used by another symbols view provider to
          toggle the display of file symbols. Only relevant if the
          **Override Commands** setting is enabled.`,
        order: 3,
        type: 'string'
      },
      toggleProjectSymbolsCommand: {
        default: 'symbols-view:toggle-project-symbols',
        description:
          `The command name used by another symbols view provider to
          toggle the display of project symbols. Only relevant if the
          **Override Commands** setting is enabled.`,
        order: 4,
        type: 'string'
      }
    };
  }

  getExecutablePath() {
    return atom.config.get('rustsym.executablePath');
  }

  getSearchDebounceTime() {
    return atom.config.get('rustsym.searchDebounceTime') ||
           this.schema.searchDebounceTime.default;
  }

  getToggleFileSymbolsCommand() {
    return atom.config.get('rustsym.toggleFileSymbolsCommand') ||
           this.schema.toggleFileSymbolsCommand.default;
  }

  getToggleProjectSymbolsCommand() {
    return atom.config.get('rustsym.toggleProjectSymbolsCommand') ||
           this.schema.toggleProjectSymbolsCommand.default;
  }

  isOverrideCommandsEnabled() {
    return atom.config.get('rustsym.overrideCommands') ||
           this.schema.overrideCommands.default;
  }

  watchOverrideCommands(callback) {
    return atom.config.onDidChange('rustsym.overrideCommands', event => callback(event.newValue));
  }

  watchSearchDebounceTime(callback) {
    return atom.config.onDidChange('rustsym.searchDebounceTime', event => callback(event.newValue));
  }

  watchToggleFileSymbolsCommand(callback) {
    return atom.config.onDidChange('rustsym.toggleFileSymbolsCommand', event => callback(event.newValue));
  }

  watchToggleProjectSymbolsCommand(callback) {
    return atom.config.onDidChange('rustsym.toggleProjectSymbolsCommand', event => callback(event.newValue));
  }

}

export default new Config();
