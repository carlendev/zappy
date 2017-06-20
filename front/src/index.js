import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "bulma/css/bulma.css";
import "./index.css";

ReactDOM.render(
  <div>
    <div className="centered">
      <h2 className="title is-2">Welcome to ZAPPY</h2>
    </div>
    <App />
  </div>,
  document.getElementById("root")
);
