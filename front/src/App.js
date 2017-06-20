import React, { Component } from "react";
import Game from "./Game";
import Data from "./Data";

class App extends Component {
  nextStep() {
    document.getElementById("game").style.display = "block";
    document.getElementById("data").style.display = "none";
  }

  render() {
    return (
      <div>
        <div id="data" className="container">
          <Data nextStep={this.nextStep} />
        </div>

        <Game />

      </div>
    );
  }
}

export default App;
