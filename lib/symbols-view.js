/** @babel */

import * as path from 'path';
import { CompositeDisposable, Point } from 'atom';
import SelectListView from 'atom-select-list';
import config from './config';
import StatusBar from './status-bar';
import SymbolsSearcher from './symbols-searcher';
import SymbolsViewListItem from './symbols-view-list-item';

export default class SymbolsView {

  constructor() {
    this.searcher = new SymbolsSearcher();
    this.searcherMode = null;
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      config.watchSearchDebounceTime(debounceFindItems.bind(this)),
    );
    this.lastFocusedElement = null;
    this.selectListView = new SelectListView({
      didCancelSelection: this.didCancelSelection.bind(this),
      didChangeQuery: this.didChangeQuery.bind(this),
      didConfirmEmptySelection: this.didConfirmEmptySelection.bind(this),
      didConfirmSelection: this.didConfirmSelection.bind(this),
      elementForItem: this.getElementForItem.bind(this),
      filterKeyForItem: item => item.name,
      items: [],
    });
    this.statusBar = new StatusBar({ mode: '', searching: false, statusMessage: '' });
    // View registry resolution rules will check for this property
    this.element = this.selectListView.element;
    this.element.classList.add('rustsym');
    // HACK: Use DOM hook to augment the SelectListView component since there
    //       is no access into the render call outside the implementation
    this.selectListView.writeAfterUpdate = () => {
      this.element.insertBefore(this.statusBar.element, null);
    };
    this.panel = atom.workspace.addModalPanel({ item: this, visible: false });
    debounceFindItems.bind(this)();
  }

  // SelectListView

  didCancelSelection() {
    this.cancel();
  }

  async didChangeQuery(query) {
    await this.selectListView.update({ items: [] });
    await this.statusBar.update({ searching: false, statusMessage: '' });
    this.debouncedFindItems(query);
  }

  didConfirmEmptySelection() {
    this.cancel();
  }

  didConfirmSelection(item) {
    if (item.path) {
      let filePath = path.resolve(item.basePath, item.path);
      atom.workspace.open(filePath).then(() => this.goToItem(item));
    } else {
      this.goToItem(item);
    }
    this.panel.hide();
  }

  getElementForItem(item) {
    return (new SymbolsViewListItem(item)).element;
  }

  // SymbolsView

  cancel() {
    this.panel.hide();
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  }

  destroy() {
    this.cancel();
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
    this.selectListView.destroy();
    this.panel.destroy();
  }

  async findItems(query) {
    this.statusBar.update({ searching: true });
    let filePath = atom.workspace.getActiveTextEditor().getPath();
    let projectPath, relativeFilePath;
    [projectPath, relativeFilePath] = atom.project.relativizePath(filePath);
    try {
      let symbols = await this.searcher.search(projectPath, relativeFilePath, query, this.searcherMode);
      symbols.map(symbol => {
        // Strip path to identify symbols in the currently active file
        if (symbol.path === relativeFilePath) symbol.path = '';
        symbol.basePath = projectPath;
        return symbol;
      });
      await this.selectListView.update({ items: symbols });
      this.selectListView.focus();
    } catch (e) {
      atom.notifications.addError(e.message, {
        description: e.stack,
        dismissable: true,
      });
    } finally {
      let resultCount = this.selectListView.items.length;
      let statusMessage = resultCount > 0
        ? `${resultCount} result${resultCount > 1 ? 's' : ''}`
        : 'No results';
      await this.statusBar.update({ searching: false, statusMessage });
    }
  }

  goToItem(item) {
    // Adjust line positions for zero-indexed points
    let position = new Point(item.line - 1, 0);
    let editor = atom.workspace.getActiveTextEditor();
    editor.scrollToBufferPosition(position, { center: true });
    editor.setCursorBufferPosition(position, { center: true });
  }

  async toggleFileSymbols(focusedElement) {
    await this.statusBar.update({ mode: 'file search' });
    this.searcherMode = SymbolsSearcher.MODE.LOCAL_CHILDREN;
    toggle.bind(this)(focusedElement);
  }

  async toggleProjectSymbols(focusedElement) {
    await this.statusBar.update({ mode: 'project search' });
    this.searcherMode = SymbolsSearcher.MODE.GLOBAL;
    toggle.bind(this)(focusedElement);
  }

}

function debounce(fn, delay, cond) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    if (typeof cond === 'function' && !cond.apply(this, args)) return;
    timeout = setTimeout(() => {
      timeout = null;
      fn.apply(this, args);
    }, delay);
  };
}

function debounceFindItems(time) {
  if (typeof time === 'undefined') {
    time = config.getSearchDebounceTime();
  }
  this.debouncedFindItems = debounce.bind(this)(this.findItems, time, query => {
    return query !== '';
  });
}

function toggle(focusedElement) {
  this.lastFocusedElement = focusedElement;
  this.panel.show();
  this.selectListView.reset();
  // HACK: Arbitrary delay is needed otherwise the view is not focused
  setTimeout(this.selectListView.focus.bind(this.selectListView), 200);
}
