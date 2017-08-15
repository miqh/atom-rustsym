/** @babel */
/** @jsx etch.dom */

import * as etch from 'etch';

export default class StatusBar {

  constructor(props) {
    this.props = Object.assign({}, props);
    etch.initialize(this);
  }

  render() {
    return (
      <div class="rustsym-status-bar">
        <div class="rustsym-status-bar__state">
          { this.props.searching
            ? <span class="loading loading-spinner-tiny inline-block"></span>
            : this.props.statusMessage
          }
        </div>
        <div>
          <span class="rustsym-status-bar__brand">rustsym</span>
          <span class="rustsym-status-bar__mode">
            { this.props.mode && ` » ${this.props.mode}` }</span>
        </div>
      </div>
    );
  }

  update(props) {
    this.props = Object.assign(this.props, props);
    etch.update(this);
  }

}
