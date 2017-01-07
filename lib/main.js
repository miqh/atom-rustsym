'use babel';

import * as path from 'path';
import { CompositeDisposable } from 'atom';
import config from './config';
import SymbolsView from './symbols-view';

class Package {

  constructor() {
    this.config = config.schema;
    this.overrideCommands = null;
    this.symbolsView = null;
    this.subscriptions = null;
    // To supplement the hard-coded activation commands specific to this
    // package, the list is dynamically adjusted to include the commands
    // specified through settings provided that overriding is enabled
    this.activationCommands = config.watchOverrideCommands(enabled => {
      let rustsym = atom.packages.getLoadedPackage('rustsym');
      rustsym.activationCommandSubscriptions.dispose();
      rustsym.activationCommands =
        JSON.parse(JSON.stringify(rustsym.metadata.activationCommands));
      if (enabled) {
        rustsym.activationCommands['atom-workspace'].push(config.getToggleProjectSymbolsCommand());
        rustsym.activationCommands['atom-text-editor'].push(config.getToggleFileSymbolsCommand());
      }
      rustsym.subscribeToActivationCommands();
    });
  }

  activate() {
    this.activationCommands.dispose();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      config.watchOverrideCommands(this.onToggleOverrideCommands.bind(this)),
      atom.commands.add(
        'atom-text-editor', 'rustsym:toggle-file-symbols', this.toggleFileSymbols.bind(this)
      ),
      atom.commands.add(
        'atom-workspace', 'rustsym:toggle-project-symbols', this.toggleProjectSymbols.bind(this)
      )
    );
  }

  deactivate() {
    if (this.symbolsView) {
      this.symbolsView.destroy();
      this.symbolsView = null;
    }
    if (this.overrideCommands) {
      this.overrideCommands.dispose();
      this.overrideCommands = null;
    }
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
  }

  isEditingRust() {
    let editor = atom.workspace.getActiveTextEditor();
    if (!editor) return false;
    return path.extname(editor.getPath()) === '.rs';
  }

  onToggleOverrideCommands(enabled) {
    if (!enabled) {
      if (this.overrideCommands) {
        this.overrideCommands.dispose();
        this.overrideCommands = null;
      }
      return;
    }
    if (this.overrideCommands == null) {
      this.overrideCommands = new CompositeDisposable();
    }
    const FILE_SYMBOLS_CMD = config.getToggleFileSymbolsCommand();
    const PROJECT_SYMBOLS_CMD = config.getToggleProjectSymbolsCommand();
    this.overrideCommands.add(
      atom.commands.add(
        'atom-text-editor', FILE_SYMBOLS_CMD, this.toggleFileSymbols.bind(this)
      ),
      atom.commands.add(
        'atom-workspace', PROJECT_SYMBOLS_CMD, this.toggleProjectSymbols.bind(this)
      )
    );
    // Ensure precedence is given to the listeners of this package
    prioritizeCommandListener(FILE_SYMBOLS_CMD, this.toggleFileSymbols.name);
    prioritizeCommandListener(PROJECT_SYMBOLS_CMD, this.toggleProjectSymbols.name);
  }

  toggleFileSymbols(event) {
    if (!initializeSymbolsView.bind(this)(event)) return;
    this.symbolsView.showFileSymbols(event.target);
  }

  toggleProjectSymbols(event) {
    if (!initializeSymbolsView.bind(this)(event)) return;
    this.symbolsView.showProjectSymbols(event.target);
  }

}

function initializeSymbolsView(event) {
  if (!this.isEditingRust()) return false;
  event.stopImmediatePropagation();
  if (this.symbolsView == null) {
    this.symbolsView = new SymbolsView();
  }
  return true;
}

function prioritizeCommandListener(command, listenerName) {
  let listeners = atom.commands.selectorBasedListenersByCommandName[command];
  let listener = listeners.find(
    // Allow substring comparison as bound functions will have their names
    // altered slightly (i.e. 'bound <fn-name>')
    listener => listener.callback.name.indexOf(listenerName) !== -1
  );
  // Although setting the lowest possible specificity should be enough to
  // guarantee the listener of interest is preferred, an extra precaution
  // would be to rearrange all listeners for the command such that the listener
  // of interest is the first item in the collection
  listener.specificity = -Infinity;
}

export default new Package();
