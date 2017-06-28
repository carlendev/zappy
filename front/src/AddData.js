import React, { Component } from "react";

export default class AddData extends Component {
  state = {
    hubName: "",
    width: "40",
    height: "40",
    team: "",
    numberPlayer: "",
    teams: [],
    error: false,
    errorTeam: false,
    errorNumberTeam: false
  };

  addToTeamList(e) {
    if (this.state.teams.includes(this.state.team)) {
      alert("Cette team existe déjà");
      this.setState({
        team: ""
      });
      return;
    } else if (this.state.team === "") {
      alert("Une team doit obligatoirement avoir un nom");
      return;
    } else if (this.state.teams.length > 7) {
      alert("Vous avez atteint le nombre maximum de team possible");
      return;
    } else if (this.state.team.includes("*")) {
      alert("Le nom de team ne peut pas comprendre un *");
      return;
    } else {
      this.setState({
        teams: [...this.state.teams, this.state.team],
        team: ""
      });
    }

    e.preventDefault();
  }

  submitForm(e) {
    e.preventDefault();

    if (this.state.numberPlayer < 1 || this.state.numberPlayer > 100) {
      this.setState({
        errorTeam: true
      });
      return;
    } else if (this.state.teams.length < 2 || this.state.teams.length > 8) {
      this.setState({
        errorNumberTeam: true,
        errorTeam: false
      });
      return;
    } else {
      if (
        this.state.hubName === "" ||
        this.state.width === "" ||
        this.state.height === ""
      ) {
        this.setState({
          error: true,
          errorNumberTeam: true,
          errorTeam: true
        });
      } else {
        const teamName = this.state.teams.join("*");
        const url =
          "game.html?hubname=" +
          this.state.hubName +
          "&width=" +
          this.state.width +
          "&height=" +
          this.state.height +
          "&team=" +
          teamName +
          "&number=" +
          this.state.numberPlayer;
        window.location.replace(url);
      }
    }
  }

  render() {
    return (
      <form>
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
              type="number"
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
              type="number"
              value={this.state.height}
              onChange={e => {
                this.setState({ height: e.target.value });
              }}
            />
          </p>
        </div>

        <label className="label">Nom de team</label>
        <div className="field has-addons">
          <p className="control is-expanded">
            <input
              className="input"
              type="text"
              value={this.state.team}
              placeholder="Minimum 2 teams"
              onChange={e => {
                this.setState({ team: e.target.value });
              }}
            />
          </p>
          <p className="control">
            <button
              className="button is-success"
              onClick={e => {
                e.preventDefault();
                this.addToTeamList(e);
              }}
            >
              Ajouter une team
            </button>
          </p>
        </div>

        <div className="content">
          <ul>
            {this.state.teams.map((team, key) => {
              return (
                <li key={key}>
                  {team}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="field">
          <label className="label">Nombre de joueurs par team</label>
          <p className="control">
            <input
              className="input"
              type="number"
              value={this.state.numberPlayer}
              onChange={e => {
                this.setState({ numberPlayer: e.target.value });
              }}
            />
          </p>
        </div>

        <div className="field is-grouped">
          <p className="control">
            <button
              className="button is-primary"
              type="submit"
              onClick={e => {
                e.preventDefault();
                this.submitForm(e);
              }}
            >
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
        {this.state.errorTeam
          ? <div className="notification is-danger">
              Vous devez rentrer entre 1 et 100 joueurs par team
            </div>
          : ""}
        {this.state.errorNumberTeam
          ? <div className="notification is-danger">
              Vous devez rentrer entre 2 et 7 teams.
            </div>
          : ""}
      </form>
    );
  }
}
