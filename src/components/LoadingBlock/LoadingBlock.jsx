import React, { Component } from "react";
import SVGSpinner from "../SVGSpinner";
import "./LoadingBlock.scss";

class LoadingBlock extends Component {
  render() {
    return (
      <div className="loading-block">
        <SVGSpinner strokeColor="#51575C" />
      </div>
    );
  }
}

export default LoadingBlock;
