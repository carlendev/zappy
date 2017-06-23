import React, { Component } from "react";
import Game from "./Game";
import Data from "./Data";

class App extends Component {
  render() {
    return (
      <div>
        <div id="data" className="container">
          <Data />
        </div>
        <Game />
      </div>
    );
  }
}

export default App;
