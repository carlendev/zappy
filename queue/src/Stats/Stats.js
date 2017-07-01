import React, { Component } from "react";

import Loader from "../Components/Loader";

export default class Stats extends Component {
  state = {};

  render() {
    const {
      inactiveCount,
      completeCount,
      activeCount,
      failedCount,
      delayedCount,
      workTime
    } = this.props.stats;

    if (this.state.loading) {
      return <Loader />;
    }

    return (
      <section className="section">
        <div className="box">
          <h2 className="title is-2">Stats</h2>
          <div className="content">
            <strong>activeCount : </strong> {activeCount}
            <br />
            <strong>inactiveCount : </strong> {inactiveCount}
            <br />
            <strong>completeCount : </strong> {completeCount}
            <br />
            <strong>failedCount : </strong> {failedCount}
            <br />
            <strong>delayedCount : </strong> {delayedCount}
            <br />
            <strong>workTime : </strong> {workTime}
            <br />
          </div>
        </div>
      </section>
    );
  }
}
