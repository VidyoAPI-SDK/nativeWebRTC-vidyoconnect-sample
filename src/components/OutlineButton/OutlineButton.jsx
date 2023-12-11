import React from "react";
import { test } from "utils/helpers";
import "./OutlineButton.scss";

export const OutlineButton = ({ onClick, className = "", label, testId }) => {
  return (
    <button
      className={`vc-btn ${className}`}
      onClick={onClick}
      {...test(testId)}
    >
      {label}
    </button>
  );
};
