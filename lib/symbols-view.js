'use babel';

import * as path from 'path';
import { $ } from 'space-pen';
import { CompositeDisposable, Point } from 'atom';
import { SelectListView } from 'atom-space-pen-views';
import config from './config';
import SymbolsSearcher from './symbols-searcher';

export default class SymbolsView extends SelectListView {

  // Inherited Methods

  initialize() {
    super.initialize();
    this.searcher = new SymbolsSearcher();
    this.searcherMode = null;
    this.subscriptions = new CompositeDisposable();
    this.filteredItemCount = 0;
    this.panel = atom.workspace.addModalPanel({
      item: this,
      visible: false
    });
    this.lastFocusedElement = null;
    this.listElement = this.find('.list-group');
    this.loadingStateElement = $(`
      <span class="loading loading-spinner-tiny inline-block"></span>
    `);
    this.statusBarElement = $(`
      <div class="rustsym-status-bar">
        <div class="rustsym-status-bar__state"></div>
        <div>
          <span class="rustsym-status-bar__brand">rustsym</span>
          <span class="rustsym-status-bar__mode"></span>
        </div>
      </div>
    `);
    this.stateElement = this.statusBarElement.find('.rustsym-status-bar__state');
    this.listElement.after(this.statusBarElement);
    this.addClass('rustsym');
    this.subscriptions.add(
      this.filterEditorView.getModel().onDidChange(() => {
        this.listElement.hide();
        this.stateElement.text('');
        this.debouncedFindItems();
      }),
      config.watchSearchDebounceTime(debounceFindItems.bind(this))
    );
    // Call required to set up initial search debounce
    debounceFindItems.bind(this)();
  }

  cancel() {
    super.cancel();
    this.lastFocusedElement.focus();
  }

  cancelled() {
    this.panel.hide();
  }

  confirmed(item) {
    if (item.path) {
      let filePath = path.resolve(item.basePath, item.path);
      atom.workspace.open(filePath).then(() => this.goToItem(item));
    } else {
      this.goToItem(item);
    }
    this.panel.hide();
  }

  destroy() {
    this.cancel();
    this.panel.destroy();
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
  }

  // Only triggers if there are no items after filtering
  getEmptyMessage(itemCount, filteredItemCount) {
    this.filteredItemCount = filteredItemCount;
    // Do not use parent placeholder for error messages
    return '';
  }

  getFilterKey() {
    return 'name';
  }

  viewForItem(item) {
    return `
      <li class="rustsym-symbol">
        <div class="rustsym-symbol__name">
          <span class="rustsym-symbol__kind">${item.kind}</span>
          <span>${item.name}</span>
          ${item.container ? '<span class="rustsym-symbol__container">(' + item.container + ')</span>' : ''}
        </div>
        <div class="rustsym-symbol__location">${item.path ? item.path : 'line ' + item.line}</div>
      </li>
    `;
  }

  // Other Methods

  clearItems() {
    this.setItems();
    this.error.hide();
  }

  findItems() {
    this.stateElement.html(this.loadingStateElement);
    let filePath = atom.workspace.getActiveTextEditor().getPath();
    let projectPath, relativeFilePath;
    [projectPath, relativeFilePath] = atom.project.relativizePath(filePath);
    let query = this.getFilterQuery();
    this.searcher.search(projectPath, relativeFilePath, query, this.searcherMode)
      .then(symbols => {
        symbols.map(symbol => {
          // Strip path to identify symbols in the currently active file
          if (symbol.path === relativeFilePath) symbol.path = '';
          symbol.basePath = projectPath;
          return symbol;
        });
        // Count will be adjusted again if all items are filtered out
        this.filteredItemCount = symbols.length;
        this.setItems(symbols);
        if (this.filteredItemCount) {
          this.listElement.show();
          let count = this.list.children().length;
          this.stateElement.text(`${count} result${count > 1 ? 's' : ''}`);
          return;
        }
        this.stateElement.text('No results');
      })
      .catch(err => {
        this.stateElement.text('');
        atom.notifications.addError(err.message, {
          description: err.stack,
          dismissable: true
        });
      });
  }

  goToItem(item) {
    // Adjust line positions for zero-indexed points
    let position = new Point(item.line - 1, 0);
    let editor = atom.workspace.getActiveTextEditor();
    editor.scrollToBufferPosition(position, { center: true });
    editor.setCursorBufferPosition(position, { center: true });
  }

  setSearchMode(searchMode) {
    this.searcherMode = searchMode;
    let statusBarModeText = '';
    switch (searchMode) {
      case SymbolsSearcher.MODE.LOCAL:
        statusBarModeText = '— file search';
        break;
      case SymbolsSearcher.MODE.GLOBAL:
        statusBarModeText = '— project search';
        break;
      case SymbolsSearcher.MODE.EXTENDED_LOCAL:
        statusBarModeText = '— extended file search';
        break;
    }
    this.statusBarElement.find('.rustsym-status-bar__mode').text(statusBarModeText);
  }

  showExtendedFileSymbols(focusedElement) {
    this.setSearchMode(SymbolsSearcher.MODE.EXTENDED_LOCAL);
    show.bind(this)(focusedElement);
  }

  showFileSymbols(focusedElement) {
    this.setSearchMode(SymbolsSearcher.MODE.LOCAL);
    show.bind(this)(focusedElement);
  }

  showProjectSymbols(focusedElement) {
    this.setSearchMode(SymbolsSearcher.MODE.GLOBAL);
    show.bind(this)(focusedElement);
  }

}

function debounce(fn, delay, cond) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    if (!cond()) return;
    timeout = setTimeout(() => {
      timeout = null;
      fn.apply(this);
    }, delay);
  };
}

function debounceFindItems(time) {
  if (typeof time === 'undefined') {
    time = config.getSearchDebounceTime();
  }
  this.debouncedFindItems = debounce.bind(this)(this.findItems, time, () => {
    return this.panel.isVisible() && this.filterEditorView.getText();
  });
}

function show(focusedElement) {
  // The inherited method for storing the focused element does not appear to
  // save the correct element so it is tracked manually
  this.lastFocusedElement = $(focusedElement);
  this.clearItems();
  this.listElement.hide();
  this.panel.show();
  this.focusFilterEditor();
}
