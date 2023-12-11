import React from "react";
import { Select } from "@blueprintjs/select";
import "./SelectList.scss";

const SelectList = (props) => {
  return (
    <div className={props.className}>
      <span className="select-list-header">
        {props.icon}
        {props.name}
      </span>

      <Select {...props} />
    </div>
  );
};

export default SelectList;
