'use babel';

import * as path from 'path';
import { CompositeDisposable } from 'atom';
import SymbolsView from './symbols-view';

export default {

  symbolsView: null,
  subscriptions: null,

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'symbols-view:toggle-file-symbols': event => this.toggleFileSymbols(event)
      }),
      atom.commands.add('atom-text-editor', {
        'symbols-view:toggle-project-symbols': event => this.toggleProjectSymbols(event)
      })
    );
    // HACK: Hi-jack key mappings bound to symbols-view package events
    let fileSymbolListeners =
      atom.commands.selectorBasedListenersByCommandName['symbols-view:toggle-file-symbols'];
    let fileSymbolListener = fileSymbolListeners.find(
      listener => listener.callback.name === 'symbolsViewToggleFileSymbols'
    );
    fileSymbolListener.specificity = fileSymbolListeners.length;
    let projectSymbolListeners =
      atom.commands.selectorBasedListenersByCommandName['symbols-view:toggle-project-symbols'];
    let projectSymbolListener = projectSymbolListeners.find(
      listener => listener.callback.name === 'symbolsViewToggleProjectSymbols'
    );
    projectSymbolListener.specificity = projectSymbolListeners.length;
  },

  deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
    if (this.symbolsView) {
      this.symbolsView.destroy();
      this.symbolsView = null;
    }
  },

  toggleFileSymbols(event) {
    if (!initializeSymbolsView.bind(this)(event)) return;
    this.symbolsView.showFileSymbols(event.target);
  },

  toggleProjectSymbols(event) {
    if (!initializeSymbolsView.bind(this)(event)) return;
    this.symbolsView.showProjectSymbols(event.target);
  },

  isEditingRust() {
    let editor = atom.workspace.getActiveTextEditor();
    if (!editor) return false;
    return path.extname(editor.getPath()) === '.rs';
  }

};

function initializeSymbolsView(event) {
  if (!this.isEditingRust()) return false;
  event.stopImmediatePropagation();
  if (this.symbolsView == null) {
    this.symbolsView = new SymbolsView();
  }
  return true;
}
