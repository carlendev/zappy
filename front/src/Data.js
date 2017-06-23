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
    <div>
        <div className="box">
            <article className="media">
                <div className="media-content">
                    <div className="content">
                        <div className="columns">
                            <div className="column is-half">
                            <p><strong>Partie 1</strong></p>

                            </div>
                            <div className="column is-one-quarter">
                                <small>3 minutes</small>
                            </div>
                            <div className="column">
                                    <a className="button is-primary">Rejoindre</a>
                            </div>
                            <div className="column">
                                <a className="button is-info">Regarder</a>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
        <div className="box">
            <article className="media">
                <div className="media-content">
                    <div className="content">
                        <div className="columns">
                            <div className="column is-half">
                                <p><strong>Partie 2</strong></p>

                            </div>
                            <div className="column is-one-quarter">
                                <small>5 minutes</small>
                            </div>
                            <div className="column">
                                <a className="button is-primary">Rejoindre</a>
                            </div>
                            <div className="column">
                                <a className="button is-info">Regarder</a>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
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
    </div>
    );
  }
}
