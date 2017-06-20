import React, { Component } from "react";

export default class Data extends Component {
  state = {};
  render() {
    return (
      <form>
        <div className="field">
          <label className="label">Name</label>
          <p className="control">
            <input className="input" type="text" placeholder="Text input" />
          </p>
        </div>

        <button className="button is-info" onClick={this.nextStep}>
          Jouer
        </button>

      </form>
    );
  }
}
