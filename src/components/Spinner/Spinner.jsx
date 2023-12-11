import React from "react";
import spinner from "assets/images/others/spinner.gif";
import circle from "assets/images/others/spinner_circle.svg";
import "./Spinner.scss";

const Spinner = ({ bubbles, ...props }) => {
  const src = bubbles ? circle : spinner;
  return (
    <div className="spinner">
      <img alt="Loading" src={src} {...props} />
    </div>
  );
};

export default Spinner;
