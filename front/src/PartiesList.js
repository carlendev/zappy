import React, { Component } from "react";
import axios from "axios";

import Loader from "./components/Loader";

export default class PartiesList extends Component {
  state = {
    hubs: [],
    loading: false
  };

  componentDidMount() {
    this.fetchHubs();
  }

  fetchHubs() {
    this.setState({ loading: true });
    axios
      .get("http://127.0.0.1:3001/api/hubs")
      .then(res => {
        this.setState({
          hubs: res.data.data.hubs,
          loading: false
        });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          loading: false,
          error: true
        });
      });
  }
  render() {
    if (this.state.loading) {
      return <Loader />;
    }
    if (this.state.error) {
      return (
        <div className="notification is-danger">
          Une erreur s'est produite. Le serveur ou la base de donnée REDIS n'est
          pas être pas en fonctionnement
        </div>
      );
    }
    return (
      <div>
        {this.state.hubs.length === 0
          ? <h2 className="title is-4">Il n'y a aucune partie en cours</h2>
          : <h2 className="title is-4">Liste des parties en cours</h2>}
        {this.state.hubs.map(hub => {
          console.log(hub);
          return (
            <div className="box" key={hub.id}>
              <article className="media">
                <div className="media-content">
                  <div className="content">
                    <div className="columns">
                      <div className="column is-half">
                        <p>
                          <strong>
                            {hub.hubName}
                          </strong>
                        </p>
                      </div>
                      <div className="column is-one-quarter">
                        <small>
                          {hub.clientsPerTeam} joueurs par team
                        </small>
                      </div>
                      <div className="column">
                        <a
                          className="button is-primary"
                          href={
                            "game.html?id=" + hub.id + "&hubname=" + hub.hubName
                          }
                        >
                          Rejoindre
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          );
        })}

        <div>
          <button
            className="button is-info is-medium"
            onClick={this.props.nextStep}
          >
            <span className="icon is-medium">
              <i className="fa fa-plus" aria-hidden="true" />
            </span>
            <span>Creer une nouvelle partie</span>
          </button>
        </div>
      </div>
    );
  }
}
