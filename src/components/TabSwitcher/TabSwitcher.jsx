import React from "react";
import { test } from "utils/helpers";

import "./TabSwitcher.scss";

const TabSwitcher = (props) => {
  if (!props.tabs) {
    return null;
  }

  let activeTab = (
    props.tabs.filter((tab) => {
      return props.activeTabId === tab.id;
    })[0] || props.tabs[0]
  ).content;

  let tabs = [];

  props.tabs.forEach((item) => {
    tabs = [
      ...tabs,
      <div
        {...test(`SETTINGS_TAB_${item.id.toUpperCase()}`)}
        className="tab"
        data-active={props.activeTabId === item.id}
        disabled={item.disabled}
        key={item.id}
        onClick={() => {
          props.changeTab(item.id);
        }}
      >
        <div className="invite-icon-block">
          <div
            className="invite-icon"
            style={
              props.activeTabId === item.id && item.activeIcon
                ? { backgroundImage: "url(" + item.activeIcon + ")" }
                : { backgroundImage: "url(" + item.icon + ")" }
            }
          ></div>
          <div className="tab-label" id={item.id}>
            {item.label}
          </div>
        </div>
      </div>,
    ];
  });

  return (
    <div
      className={`tab-switcher ${props.bottom ? "bottom" : ""} ${
        props.className ?? ""
      }`}
    >
      <div className="tab-bar">{tabs}</div>
      <div className="tab-content">{activeTab}</div>
    </div>
  );
};

export default TabSwitcher;
