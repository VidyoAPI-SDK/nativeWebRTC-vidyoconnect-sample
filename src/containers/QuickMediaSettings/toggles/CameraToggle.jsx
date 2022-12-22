import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useTranslation } from "react-i18next";
import * as devicesActionCreators from "store/actions/devices";
import * as googleAnalytics from "store/actions/googleAnalytics";
import DeviceToggle from "components/DeviceToggle";
import { test } from "utils/helpers";
import DeviceMenu from "../../DeviceMenu/DeviceMenu";
import { deviceDisableReason, deviceTooltipTimeout } from "utils/constants";
import { useModerationStatuses, useIsTouchScreen } from "utils/hooks";
import { Position, Tooltip } from "@blueprintjs/core";
import { isMobile } from "react-device-detect";
import OperatingSystemInfoProvider from "utils/deviceDetect";

const mapStateToProps = ({ devices, config }) => ({
  cameras: devices.cameras,
  selectedCamera: devices.selectedCamera,
  isCameraTurnedOn: devices.isCameraTurnedOn,
  isCameraDisabled: devices.isCameraDisabled,
  cameraMuteControlToggle: config.urlCameraMuteControl.value,
  cameraModerationState: devices.cameraModerationState,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators(googleAnalytics, dispatch),
});

let cameraTooltipTimeout;

const CameraToggle = ({
  cameras,
  selectedCamera,
  cameraTurnOn,
  cameraTurnOff,
  isCameraDisabled,
  isCameraTurnedOn,
  showLabel,
  rightClickOnDevice,
  cameraMuteControlToggle,
  showTooltip = true,
  cameraModerationState,
  tooltipPosition,
  deviceMenuStyle,
}) => {
  const { t } = useTranslation();
  const { isUserAdmin, isUserRoomOwner } = useModerationStatuses();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const prevState = useRef();
  const isTouchScreen =
    useIsTouchScreen() ||
    isMobile ||
    OperatingSystemInfoProvider.IsTabletDevice();
  const cameraOnClick = (e) => {
    if (e.target.classList.contains("inactive")) {
      return e.preventDefault();
    }

    isCameraTurnedOn
      ? cameraTurnOff({ selectedCamera })
      : cameraTurnOn({ selectedCamera });
  };

  const cameraOnMouseDown = (event) => {
    if (event.nativeEvent.which === 3) {
      rightClickOnDevice("camera");
    }
  };

  const onMouseEnterButton = () => {
    if (!showTooltip) {
      return;
    }

    if (
      cameraModerationState?.moderationType ===
        deviceDisableReason.HARD_MUTED &&
      !isUserAdmin &&
      !isUserRoomOwner &&
      cameraModerationState?.state
    ) {
      setTooltipContent(t("DISABLED_BY_MODERATOR"));
    }

    setIsTooltipOpen(true);
  };

  const onMouseLeaveButton = () => {
    if (!showTooltip) {
      return;
    }
    setIsTooltipOpen(false);
  };

  const onTooltipClosed = () => {
    setTooltipContent(getCameraStateText());
  };

  const getCameraStateText = () => {
    if (isTouchScreen) return;

    return (
      <span
        dangerouslySetInnerHTML={{
          __html:
            `<b>${selectedCamera?.name}</b>` +
            (isCameraTurnedOn
              ? t("CAMERA_TOOL_TIP_ACTIVE")
              : t("CAMERA_TOOL_TIP_MUTED")),
        }}
      ></span>
    );
  };

  useEffect(() => {
    if (
      cameraModerationState?.moderationType !==
        deviceDisableReason.HARD_MUTED &&
      cameraModerationState?.moderationType !== deviceDisableReason.SOFT_MUTED
    ) {
      setTooltipContent(getCameraStateText());
    }
    if (
      prevState.current?.moderationType ===
        cameraModerationState?.moderationType &&
      prevState.current?.state === cameraModerationState?.state
    ) {
      prevState.current = cameraModerationState;
      return;
    }

    if (
      cameraModerationState?.moderationType ===
        deviceDisableReason.HARD_MUTED &&
      !isUserAdmin &&
      !isUserRoomOwner
    ) {
      setTooltipContent(
        !cameraModerationState?.state
          ? isCameraTurnedOn
            ? ""
            : t("ENABLED_BY_MODERATOR")
          : t("DISABLED_BY_MODERATOR")
      );
      setIsTooltipOpen(true);
    } else if (
      (cameraModerationState?.moderationType ===
        deviceDisableReason.SOFT_MUTED &&
        cameraModerationState?.state) ||
        (cameraModerationState?.moderationType ===
          deviceDisableReason.HARD_MUTED &&
          (isUserAdmin || isUserRoomOwner))
    ) {
      setTooltipContent(
        cameraModerationState?.state ? (
          <span
            dangerouslySetInnerHTML={{
              __html: t("DISABLED_BY_MODERATOR_CLICK_TO_REENABLE"),
            }}
          ></span>
        ) : (
          ""
        )
      );
      setIsTooltipOpen(true);
    } else {
      setTooltipContent("");
      setIsTooltipOpen(false);
    }

    clearTimeout(cameraTooltipTimeout);
    cameraTooltipTimeout = setTimeout(() => {
      setIsTooltipOpen(false);
    }, deviceTooltipTimeout);

    prevState.current = cameraModerationState;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isUserAdmin,
    cameraModerationState,
    t,
    isUserRoomOwner,
    isCameraTurnedOn,
    isTouchScreen,
  ]);

  const isButtondisabled =
    cameraModerationState?.moderationType === deviceDisableReason.HARD_MUTED &&
    !isUserAdmin &&
    !isUserRoomOwner &&
    cameraModerationState?.state;

  if (!cameraMuteControlToggle) {
    return null;
  }

  return (
    <div className="device-toggle">
      <Tooltip
        content={tooltipContent}
        isOpen={isTooltipOpen}
        onClosed={onTooltipClosed}
        portalClassName="device-tooltip"
        position={tooltipPosition || Position.TOP_LEFT}
        disabled={!showTooltip || !tooltipContent || isCameraDisabled}
      >
        <DeviceToggle
          {...test("CAMERA_TOGGLE")}
          disabled={!cameras.length || !selectedCamera || isCameraDisabled}
          on={isCameraTurnedOn}
          classList={`camera ${isButtondisabled ? "inactive" : ""}`}
          onClick={cameraOnClick}
          onMouseDown={cameraOnMouseDown}
          onMouseEnter={onMouseEnterButton}
          onMouseLeave={onMouseLeaveButton}
        />
      </Tooltip>
      <DeviceMenu
        deviceType="camera"
        menuHeader={t("SELECT_CAMERA")}
        disabled={!cameras.length || isCameraDisabled}
        active={!isButtondisabled}
        deviceMenuStyle={deviceMenuStyle}
      >
        <button
          type="button"
          className="device-menu-toggle"
          {...test("CAMERA_MENU_TOGGLE")}
        />
      </DeviceMenu>
      {showLabel && (
        <div className="device-wrapper">
          <label>{t("CAMERA")}</label>
          <div className="toggle-label">
            {isCameraDisabled
              ? t("CAMERA_DISABLED")
              : selectedCamera
              ? selectedCamera.name
              : cameras.length
              ? t("NO_ACTIVE_CAMERA")
              : t("NO_CAMERA")}
          </div>
        </div>
      )}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraToggle);
