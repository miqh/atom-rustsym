/** @babel */

import * as path from 'path';
import { CompositeDisposable } from 'atom';
import config from './config';
import SymbolsView from './symbols-view';

class Package {

  activate() {
    this.config = config.schema;
    this.overrideCommands = null;
    this.symbolsView = null;
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      config.watchOverrideCommands(updateOverrideCommands.bind(this)),
      config.watchToggleFileSymbolsCommand(() => updateOverrideCommands.bind(this)()),
      config.watchToggleProjectSymbolsCommand(() => updateOverrideCommands.bind(this)()),
      atom.commands.add('atom-text-editor', 'rustsym:toggle-file-symbols', this.toggleFileSymbols.bind(this)),
      atom.commands.add('atom-workspace', 'rustsym:toggle-project-symbols', this.toggleProjectSymbols.bind(this)),
    );
    // Call required to set up initial state for override commands
    updateOverrideCommands.bind(this)();
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

  toggleFileSymbols(event) {
    if (!initializeSymbolsView.bind(this)(event)) return;
    this.symbolsView.toggleFileSymbols(event.target);
  }

  toggleProjectSymbols(event) {
    if (!initializeSymbolsView.bind(this)(event)) return;
    this.symbolsView.toggleProjectSymbols(event.target);
  }

}

function initializeSymbolsView(event) {
  if (!this.isEditingRust()) return false;
  // Consume triggering event
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

function updateOverrideCommands(enableOverrides) {
  // Clean up and rebind all override commands for simplicity
  if (this.overrideCommands != null) {
    this.overrideCommands.dispose();
    this.overrideCommands = null;
  }
  // Update using current override commands state if none is given
  if (typeof enableOverrides === 'undefined') {
    enableOverrides = config.isOverrideCommandsEnabled();
  }
  if (!enableOverrides) return;
  this.overrideCommands = new CompositeDisposable();
  const FILE_SYMBOLS_CMD = config.getToggleFileSymbolsCommand();
  const PROJECT_SYMBOLS_CMD = config.getToggleProjectSymbolsCommand();
  this.overrideCommands.add(
    atom.commands.add('atom-text-editor', FILE_SYMBOLS_CMD, this.toggleFileSymbols.bind(this)),
    atom.commands.add('atom-workspace', PROJECT_SYMBOLS_CMD, this.toggleProjectSymbols.bind(this))
  );
  // Ensure precedence is given to the listeners of this package
  prioritizeCommandListener(FILE_SYMBOLS_CMD, this.toggleFileSymbols.name);
  prioritizeCommandListener(PROJECT_SYMBOLS_CMD, this.toggleProjectSymbols.name);
}

export default new Package();
