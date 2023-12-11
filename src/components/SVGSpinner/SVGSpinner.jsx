import React from "react";
import "./SVGSpinner.scss";

const SVGSpinner = ({ strokeColor }) => {
  const stroke = strokeColor || "white";
  return (
    <svg className="svg-spinner" viewBox="0 0 50 50">
      <circle
        className="path"
        cx="25"
        cy="25"
        r="20"
        stroke={stroke}
        fill="none"
        strokeWidth="3.5"
      ></circle>
    </svg>
  );
};

export default SVGSpinner;
