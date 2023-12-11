import React from "react";
import "./SelfView.scss";

const SelfView = (props) => {
  return (
    <div className={`self-view ${props.cameraOff ? "off" : ""}`}>
      <div className="placeholder">{props.placeholder}</div>
      <div id="self-view-render"></div>
    </div>
  );
};

export default SelfView;
