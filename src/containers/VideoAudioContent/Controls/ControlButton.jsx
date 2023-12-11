import React from "react";

const ControlButton = ({ changeState, className, children }) => {
  return (
    <button type="button" className={className} onClick={changeState}>
      {children}
    </button>
  );
};

export default ControlButton;
