import React from "react";

const PartiesList = ({ nextStep }) => {
  return (
    <div>
      <h2 className="title is-4">Liste des parties en cours</h2>
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
                  <a className="button is-primary" href="game.html?id=1">
                    Rejoindre
                  </a>
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
                  <a className="button is-primary" href="game.html?id=2">
                    Rejoindre
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
      <div>
        <button className="button is-info is-medium" onClick={nextStep}>
          <span className="icon is-medium">
            <i className="fa fa-plus" aria-hidden="true" />
          </span>
          <span>Creer une nouvelle partie</span>
        </button>
      </div>
    </div>
  );
};

export default PartiesList;
