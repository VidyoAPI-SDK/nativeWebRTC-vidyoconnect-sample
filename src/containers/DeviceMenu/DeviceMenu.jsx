import React, { useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import DeviceMenuList from "./DeviceMenuList";
import { Popover, Position } from "@blueprintjs/core";
import * as googleAnalytics from "store/actions/googleAnalytics";
import { isMobileSafari, isAndroid } from "react-device-detect";
import { useMobileDimension } from "utils/hooks";
import "./DeviceMenu.scss";

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(googleAnalytics, dispatch),
});

const DeviceMenu = ({
  deviceType,
  menuHeader,
  disabled,
  children,
  clickOnArrowBtnNextToDeviceIcon,
  active = true,
  deviceMenuStyle = "",
}) => {
  const [deviceListMenuState, setDeviceListMenuState] = useState(false);
  const [isMobileDimension] = useMobileDimension();

  const toggleDeviceListMenu = (state) => {
    if (active) {
      setDeviceListMenuState(state);
    }
  };

  if (
    !(
      deviceType === "microphone" ||
      deviceType === "camera" ||
      deviceType === "speaker"
    )
  ) {
    return <span className="device-menu-off" />;
  }

  if (isMobileSafari || isAndroid || isMobileDimension) {
    return <span className="device-menu-off" />;
  }

  if (disabled) {
    return <div className="device-menu-disabled" />;
  }

  return (
    <Popover
      content={
        <DeviceMenuList deviceType={deviceType} menuHeader={menuHeader} />
      }
      interactionKind="click"
      popoverClassName={`device-menu-popover ${deviceMenuStyle}`}
      targetClassName="device-menu-popover-target"
      isOpen={deviceListMenuState}
      onInteraction={(state) => toggleDeviceListMenu(state)}
      onOpening={() => {
        clickOnArrowBtnNextToDeviceIcon(deviceType);
      }}
      position={Position.TOP}
    >
      {children}
    </Popover>
  );
};

export default connect(null, mapDispatchToProps)(DeviceMenu);
