import React, { Component } from "react";

export default class Data extends Component {
  constructor(props) {
    super(props);
    this.firstStep = this.firstStep.bind(this);
  }
  state = {};

  firstStep(e) {
    e.preventDefault();
    document.getElementById("game").style.display = "block";
    document.getElementById("data").style.display = "none";
  }

  render() {
    return (
      <form>

        <div className="field">
          <label className="label">Name</label>
          <p className="control">
            <input className="input" type="text" placeholder="Text input" />
          </p>
        </div>

        <button className="button is-info" onClick={this.firstStep}>
          Jouer
        </button>

      </form>
    );
  }
}
