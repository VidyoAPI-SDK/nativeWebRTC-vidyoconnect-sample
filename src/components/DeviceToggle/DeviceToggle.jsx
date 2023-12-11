import React from "react";
import { test } from "utils/helpers";

import "./DeviceToggle.scss";

const DeviceToggle = (props) => {
  return (
    <button
      disabled={props.disabled}
      aria-disabled={props.disabled ? "true" : "false"}
      data-on={props.on}
      className={`toggle ${props.classList}`}
      onClick={props.onClick}
      {...test(props["data-test-id"])}
      onMouseDown={props.onMouseDown}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      aria-label={props.ariaLabel}
    >
      {props.children}
    </button>
  );
};

export default DeviceToggle;
