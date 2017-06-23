import React, { Component } from "react";

export default class Data extends Component {
  constructor(props) {
    super(props);
    this.onChangePseudo = this.onChangePseudo.bind(this);
    this.firstStep = this.firstStep.bind(this);
  }
  state = {
    step: 0,
    pseudo: ""
  };

  onChangePseudo(event) {
    event.preventDefault();
    this.setState({
      pseudo: event.target.value
    });
  }

  firstStep(e) {
    e.preventDefault();
    if (this.state.step === 1) {
      document.getElementById("game").style.display = "block";
      document.getElementById("data").style.display = "none";
    } else {
      if (this.state.pseudo === "") {
        alert("Veuillez entrez un pseudo valide");
        return;
      }
      this.setState({
        step: 1
      });
    }
  }

  play(e) {
    window.location.replace("game.html");
    e.preventDefault();
  }

  render() {
    switch (this.state.step) {
      case 1: {
        return (
          <div>
            <h2 className="title is-2">Liste des parties en cours</h2>
            <div className="box">
              <article className="media">
                <div className="media-content">
                  <div className="content">
                    <div className="columns">
                      <div className="column is-half">
                        <p><strong>Partie de Guillaume</strong></p>

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
                        <p><strong>Partie de Ludovic</strong></p>
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

            <div>
              <button className="button is-info is-medium">
                <span className="icon is-medium">
                  <i className="fa fa-plus" aria-hidden="true" />
                </span>
                <span>Creer une nouvelle partie</span>
              </button>
            </div>

          </div>
        );
      }
      default: {
        return (
          <form className="has-text-centered">
            <div className="field">
              <label className="label">Name</label>
              <p className="control">
                <input
                  className="input"
                  type="text"
                  value={this.state.pseudo}
                  onChange={this.onChangePseudo}
                />
              </p>
            </div>
            <button className="button is-info" onClick={this.firstStep}>
              Jouer
            </button>
          </form>
        );
      }
    }
  }
}
