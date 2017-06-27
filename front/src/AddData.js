import React, { Component } from "react";

export default class AddData extends Component {
  state = {
    hubName: "",
    width: "40",
    height: "40",
    team: "",
    error: false
  };

  submitForm(e) {
    e.preventDefault();
    if (
      this.state.hubName === "" ||
      this.state.width === "" ||
      this.state.height === "" ||
      this.state.team === ""
    ) {
      this.setState({
        error: true
      });
    } else {
      const url =
        "game.html?hubname=" +
        this.state.hubName +
        "&width=" +
        this.state.width +
        "&height=" +
        this.state.height +
        "&team=" +
        this.state.team;
      window.location.replace(url);
    }
  }

  render() {
    return (
      <form
        onSubmit={e => {
          this.submitForm(e);
        }}
      >
        <h2 className="title is-4">Creer une nouvelle partie</h2>
        <div className="field">
          <label className="label">HubName</label>
          <p className="control">
            <input
              className="input"
              type="text"
              value={this.state.hubName}
              onChange={e => {
                this.setState({ hubName: e.target.value });
              }}
            />
          </p>
        </div>

        <div className="field">
          <label className="label">Largeur de la map</label>
          <p className="control">
            <input
              className="input"
              type="text"
              value={this.state.width}
              onChange={e => {
                this.setState({ width: e.target.value });
              }}
            />
          </p>
        </div>

        <div className="field">
          <label className="label">Hauteur de la map</label>
          <p className="control">
            <input
              className="input"
              type="text"
              value={this.state.height}
              onChange={e => {
                this.setState({ height: e.target.value });
              }}
            />
          </p>
        </div>

        <div className="field">
          <label className="label">Team</label>
          <p className="control">
            <input
              className="input"
              type="text"
              value={this.state.team}
              onChange={e => {
                this.setState({ team: e.target.value });
              }}
            />
          </p>
        </div>

        <div className="field is-grouped">
          <p className="control">
            <button className="button is-primary" type="submit">
              Creer la partie
            </button>
          </p>
          <p className="control">
            <button
              className="button is-warning"
              onClick={e => {
                e.preventDefault();
                window.location.reload();
              }}
            >
              Retour
            </button>
          </p>
        </div>

        {this.state.error
          ? <div className="notification is-danger">
              Veuillez remplir tous les champs
            </div>
          : ""}
      </form>
    );
  }
}
