/** @babel */
/** @jsx etch.dom */

import * as etch from 'etch';

export default class SymbolsViewListItem {

  constructor(props) {
    this.props = Object.assign({}, props);
    etch.initialize(this);
  }

  render() {
    return (
      <li class="rustsym-symbol">
        <div class="rustsym-symbol__name">
          <span class="rustsym-symbol__kind">{ this.props.kind }</span>
          <span>{ this.props.name }</span>
          { this.props.container &&
            <span class="rustsym-symbol__container"> ({ this.props.container })</span> }
        </div>
        <div class="rustsym-symbol__location">{ this.props.path || 'line ' + this.props.line }</div>
      </li>
    );
  }

  update(props) {
    this.props = Object.assign(this.props, props);
    etch.update(this);
  }

}
