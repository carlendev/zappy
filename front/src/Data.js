import React, { Component } from "react";
import PartiesList from "./PartiesList";
import AddData from "./AddData";

export default class Data extends Component {
  constructor(props) {
    super(props);
    this.nextStep = this.nextStep.bind(this);
  }
  state = {
    step: 0
  };

  nextStep() {
    this.setState({
      step: 1
    });
  }

  render() {
    switch (this.state.step) {
      case 1: {
        return <AddData />;
      }
      default: {
        return <PartiesList nextStep={this.nextStep} />;
      }
    }
  }
}
