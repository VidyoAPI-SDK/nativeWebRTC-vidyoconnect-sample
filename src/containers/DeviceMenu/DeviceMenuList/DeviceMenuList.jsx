import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCamera,
  selectMicrophone,
  selectSpeaker,
} from "store/actions/devices";
import { test, sortDevices } from "utils/helpers";
import { useSystemDefaultName } from "utils/hooks";
import { useTranslation } from "react-i18next";
import { isSafari } from "react-device-detect";
import { useEffect } from "react";

const DeviceMenuList = ({ deviceType, menuHeader }) => {
  const devices = useSelector((state) => state.devices[deviceType + "s"]);
  const sortedDevices = sortDevices(devices);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const processName = useSystemDefaultName();
  const showDefaultOutputMessage =
    deviceType === "speaker" && sortedDevices.length === 1 && isSafari;

  const onItemSelect = useCallback(
    (localDevice) => {
      if (localDevice.selected) return;

      switch (deviceType) {
        case "microphone":
          dispatch(selectMicrophone(localDevice));
          break;
        case "camera":
          dispatch(selectCamera(localDevice));
          break;
        case "speaker":
          dispatch(selectSpeaker(localDevice));
          break;
        default:
          break;
      }
    },
    [dispatch, deviceType]
  );

  const menuItem = (item) => {
    return (
      <div
        tabIndex="0"
        aria-selected={item.selected ? "true" : "false"}
        role="option"
        className={`menu-item ${deviceType}-item ${
          item.selected ? "selected" : ""
        }`}
        onClick={() => onItemSelect(item)}
        key={item.id}
        {...test(`SELECT_${deviceType.toUpperCase()}_ITEM`)}
      >
        <span>{processName(item)}</span>
      </div>
    );
  };

  const deviceList = (devices) => {
    return (
      <div className="device-list">
        {devices.map((deviceItem) => menuItem(deviceItem))}
      </div>
    );
  };

  useEffect(() => {
    document.querySelector(".device-list-menu-header")?.focus();
  }, []);

  return (
    <div
      className={`device-list-menu ${deviceType}-select-menu`}
      {...test(`${deviceType}-select-menu`)}
    >
      <div tabIndex="-1" className="device-list-menu-header">
        {menuHeader}
      </div>
      {deviceList(sortedDevices)}
      {showDefaultOutputMessage && (
        <div
          className="default-device-message"
          {...test(`DEFAULT_OUTPUT_MESSAGE`)}
        >
          {t("BROWSER_USES_DEFAULT_DEVICES_MESSAGE")}
        </div>
      )}
    </div>
  );
};

export default DeviceMenuList;
