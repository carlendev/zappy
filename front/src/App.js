import React, { Component } from "react";
import Data from "./Data";

class App extends Component {
  render() {
    return (
      <div>
        <div id="data" className="container">
          <Data />
        </div>
      </div>
    );
  }
}

export default App;
