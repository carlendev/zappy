import React, { Component } from "react";
import axios from "axios";

import Loader from "../Components/Loader";

import Stats from "../Stats/Stats";
import Jobs from "../Jobs/Jobs";

export default class Timer extends Component {
  state = {
    loading: false,
    error: false,
    stats: [],
    jobs: [],
    i: 10,
    start: 0
  };

  async fetchData() {
    this.setState({
      loading: true
    });
    try {
      const stats = await axios.get("http://127.0.0.1:3001/queue/stats");
      const jobs = await axios.get(
        `http://127.0.0.1:3001/queue/jobs/complete/${this.state.start}..${this
          .state.i}asc`
      );
      console.log(jobs);
      this.setState({
        stats: stats.data,
        jobs: jobs.data.reverse(),
        loading: false,
        i: this.state.i + this.state.jobs.length,
        start: this.state.start + this.state.jobs.length
      });
    } catch (e) {
      this.setState({
        loading: true,
        error: true
      });
      console.error(e);
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => this.fetchData(), 1000);
    //this.fetchData();
  }

  componentWillUnmout() {
    clearInterval(this.interval);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="notification is-danger">
          An error occured when fetching data.
          <br />
          You need to start the server.
          <br />
          <a href="http://127.0.0.1:3000" className="button">
            Go back
          </a>
        </div>
      );
    }

    return (
      <div>
        <Stats stats={this.state.stats} loading={this.state.loading} />
        <Jobs jobs={this.state.jobs} loading={this.state.loading} />
      </div>
    );
  }
}
