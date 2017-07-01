import React, { Component } from "react";

import Loader from "../Components/Loader";

export default class Jobs extends Component {
  state = {};
  render() {
    if (this.state.loading) {
      return <Loader />;
    }
    return (
      <section className="section">
        <h2 className="title is-2">List of last jobs</h2>
        <table className="table">
          <thead>
            <tr>
              <th>client_id</th>

              <th>duration</th>
              <th>type</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {this.props.jobs.map(job => {
              return (
                <tr key={job.id}>
                  <th>
                    {job.data.client_id}
                  </th>
                  <th>
                    {job.duration}
                  </th>
                  <th>
                    {job.type}
                  </th>

                  <th>
                    {job.data.fn}
                  </th>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    );
  }
}
