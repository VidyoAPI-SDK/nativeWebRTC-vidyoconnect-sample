import React from "react";
import "./CSSSpinner.scss";

const CSSSpinner = ({ size = 80, color = "#4c97d9", borderSize = 7 }) => {
  return (
    <div
      className="css-spinner"
      style={{ height: `${size}px`, width: `${size}px` }}
    >
      <div className="css-spinner__wrap">
        <div
          style={{
            border: `${borderSize}px solid #000`,
            borderColor: `${color} transparent ${color} transparent`,
          }}
        ></div>
        <div
          style={{
            border: `${borderSize}px solid #000`,
            borderColor: `${color} transparent ${color} transparent`,
          }}
        >
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default CSSSpinner;
