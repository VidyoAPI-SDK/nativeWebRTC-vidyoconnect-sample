import React from "react";
import { InputGroup } from "@blueprintjs/core";
import "./BeautyInput.scss";

const BeautyInput = (props) => {
  return (
    <div className="beauty-input">
      <InputGroup {...props} />
    </div>
  );
};

export default BeautyInput;
