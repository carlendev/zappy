import React from "react";
import ReactDOM from "react-dom";

import Timer from "./Timer/Timer";

import "bulma/css/bulma.css";

ReactDOM.render(
  <section className="section">
    <h2 className="title is-2">Monitoring</h2>
    <Timer />
  </section>,
  document.getElementById("root")
);
