import React, { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SelfView from "../SelfView/SelfView";
import camera from "assets/images/hardware_check/camera.svg";
import { isMobile } from "react-device-detect";
import FlipCameraButton from "containers/FlipCameraButton";
import { Classes, MenuItem } from "@blueprintjs/core";
import { useSelector, useDispatch } from "react-redux";
import { selectCamera } from "store/actions/devices";
import { test, sortDevices } from "utils/helpers";
import HWTGeneralSelectList from "./HWTGeneralSelectList";
import { Tooltip, Position, Radio, RadioGroup } from "@blueprintjs/core";
import "./HardwareCheckPopup.scss";
import OperatingSystemInfoProvider from "utils/deviceDetect";

const CameraCheck = ({ onButtonClick, isVolutanryHardwareCheck }) => {
  const { t } = useTranslation();
  const selectedCamera = useSelector((state) => state.devices.selectedCamera);

  const cameras = useSelector((state) => state.devices.cameras);
  const sortedCameras = sortDevices(cameras);
  const [deviceWorkingStatus, setDeviceWorkingStatus] = useState("");
  const { urlHWTStrictMode } = useSelector((state) => state.config);
  const dispatch = useDispatch();

  const onItemSelect = useCallback(
    (localCamera) => {
      dispatch(selectCamera(localCamera));
    },
    [dispatch]
  );

  useEffect(() => {
    if (selectedCamera) {
      setDeviceWorkingStatus("");
    } else {
      setDeviceWorkingStatus("no");
    }
  }, [selectedCamera]);
  const handleDeviceUsageStatus = (deviceStatus) => {
    setDeviceWorkingStatus(deviceStatus);
  };

  const customRenderItem = (item, { index, handleClick }) => (
    <MenuItem
      tabIndex="0"
      aria-selected={item.selected ? "true" : "false"}
      role="option"
      className={item.selected && Classes.ACTIVE}
      onClick={handleClick}
      text={item.name}
      key={index}
      {...test("SELECT_CAMERA_ITEM")}
    />
  );

  const nextButtonDisabled =
    deviceWorkingStatus === "" ||
    (deviceWorkingStatus === "no" &&
      urlHWTStrictMode.value &&
      !isVolutanryHardwareCheck);

  return (
    <div className="device-check-cointainer" {...test("CAMERA_POPUP")}>
      {isMobile || OperatingSystemInfoProvider.IsTabletDevice() ? (
        <div className="mobile-device-list-cointainer">
          <img src={camera} alt={t("CAMERA")}></img>
          <span>{t("CAMERA")}</span>
        </div>
      ) : (
        <div className="device-select-container">
          <HWTGeneralSelectList
            title={t("CAMERA")}
            icon={camera}
            disabled={selectedCamera === null}
            items={sortedCameras}
            customRenderItem={customRenderItem}
            className="hwt-speaker-select"
            onItemSelect={onItemSelect}
            selectedItemName={
              selectedCamera ? selectedCamera.name : t("NO_ACTIVE_CAMERA")
            }
            noResultsText={t("NO_CAMERA")}
            buttonProps={{
              ...test("SELECT_CAMERA"),
            }}
          />
        </div>
      )}
      {
        <SelfView
          ignoreMuteState={true}
          externalControls={<FlipCameraButton />}
        />
      }
      <div className="que-cointainer">
        <p tabIndex="0" className="lbl">
          {t("QUE_HEADER_VIDEO")}
        </p>

        <div className="audio-radio">
          <div className="radio-con">
            <Tooltip
              portalClassName="HWT-tip-tooltip"
              isOpen={
                deviceWorkingStatus === "no" &&
                !isMobile &&
                !OperatingSystemInfoProvider.IsTabletDevice()
              }
              content={
                <span
                  role="alert"
                  aria-live="polite"
                  dangerouslySetInnerHTML={{
                    __html: t("HARDWARE_TEST_TIP"),
                  }}
                ></span>
              }
              popoverClassName="hardware-tip"
              position={Position.TOP}
              usePortal={false}
            >
              <RadioGroup
                inline={true}
                disabled={selectedCamera === null}
                name="group"
                onChange={(e) => {
                  handleDeviceUsageStatus(e.target.value);
                }}
                selectedValue={deviceWorkingStatus}
              >
                <Radio
                  label={t("YES")}
                  value="yes"
                  {...test("CAMERA_CHECK_PASSED")}
                />

                <Radio
                  className={"radio-no"}
                  label={t("NO")}
                  value="no"
                  {...test("CAMERA_CHECK_FAILED")}
                />
              </RadioGroup>
            </Tooltip>
          </div>
        </div>
        <span
          {...test("CAMERA_NOT_WORKING_MESSAGE")}
          tabIndex="0"
          className={
            "device-not-working-warn" +
            (deviceWorkingStatus === "no" ? " show" : "")
          }
        >
          {urlHWTStrictMode.value && !isVolutanryHardwareCheck
            ? t("HARDWARE_TEST_WARNING_NOT_PROCEED")
            : t("HARDWARE_TEST_WARNING")}
        </span>
        <button
          className={"btn"}
          data-invalid={nextButtonDisabled}
          aria-disabled={nextButtonDisabled ? "true" : "false"}
          onClick={() => {
            if (onButtonClick && !nextButtonDisabled) {
              onButtonClick(deviceWorkingStatus);
            }
          }}
          {...test("NEXT_BUTTON")}
        >
          {t("NEXT")}
        </button>
      </div>
    </div>
  );
};

export default CameraCheck;
