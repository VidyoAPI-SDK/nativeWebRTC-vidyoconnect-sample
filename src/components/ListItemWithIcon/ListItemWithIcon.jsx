import React from "react";
import { Tooltip, Position } from "@blueprintjs/core";
import "./ListItemWithIcon.scss";

const ListItemWithIcon = ({
  data,
  parent,
  isBigStyle,
  tooltipPosition,
  inprogress,
}) => {
  if (data.tooltip) {
    return (
      <li
        role="button"
        tabIndex="0"
        onClick={data.onClickHandler}
        className={`cm-list-item ${inprogress ? "disabled" : ""}`}
      >
        <Tooltip
          popoverClassName="cm-panel-tooltip"
          content={data.tooltip}
          position={Position[tooltipPosition]}
          boundary={parent}
          openOnTargetFocus={false}
        >
          <div
            className={`cm-list-item-icon ${data.className || ""} ${
              isBigStyle && "cm-list-item-icon--big"
            }`}
          >
            {data.label}
          </div>
        </Tooltip>
      </li>
    );
  }
  return (
    <li
      role="button"
      tabIndex="0"
      onClick={data.onClickHandler}
      className={`cm-list-item ${inprogress ? "disabled" : ""}`}
    >
      <div
        className={`cm-list-item-icon ${data.className || ""} ${
          isBigStyle && "cm-list-item-icon--big"
        }`}
      >
        {data.label}
      </div>
    </li>
  );
};

export default ListItemWithIcon;
