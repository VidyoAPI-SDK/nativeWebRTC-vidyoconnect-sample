import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "react-redux";
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
import { getFormattedString } from "utils/helpers";
import hotkeys from "hotkeys-js";
import {
  getShortcutKeys,
  getShortcutKeysText,
  keyShortcutsLog,
} from "utils/keyboardShortcuts";

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
  isHotkeyEnable = false,
}) => {
  const { t } = useTranslation();
  const { isUserAdmin, isUserRoomOwner } = useModerationStatuses();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const prevState = useRef();
  const dispatch = useDispatch();
  const isTouchScreen =
    useIsTouchScreen() ||
    isMobile ||
    OperatingSystemInfoProvider.IsTabletDevice();
  const cameraOnClick = useCallback(
    (e) => {
      if (e.target.classList.contains("inactive")) {
        return e.preventDefault();
      }

      isCameraTurnedOn
        ? cameraTurnOff({ selectedCamera })
        : cameraTurnOn({ selectedCamera });
    },
    [cameraTurnOff, cameraTurnOn, isCameraTurnedOn, selectedCamera]
  );
  const CAMERA_TOOL_TIP_ACTIVE = isHotkeyEnable
    ? getShortcutKeysText(
        t("SHORTCUT_CAMERA_TOOL_TIP_ACTIVE"),
        getShortcutKeys().TOOGLE_CAMERA
      )
    : t("CAMERA_TOOL_TIP_ACTIVE");
  const CAMERA_TOOL_TIP_MUTED = isHotkeyEnable
    ? getShortcutKeysText(
        t("SHORTCUT_CAMERA_TOOL_TIP_MUTED"),
        getShortcutKeys().TOOGLE_CAMERA
      )
    : t("CAMERA_TOOL_TIP_MUTED");

  useEffect(() => {
    hotkeys.filter = function () {
      return isHotkeyEnable;
    };
    hotkeys(getShortcutKeys().TOOGLE_CAMERA, (e, handler) => {
      e.preventDefault();
      cameraOnClick(e);
      keyShortcutsLog(`Key pressed - ${handler.key}`);
      dispatch(googleAnalytics.keyboardShortcuts("CAMERA_TOOGLE"));
    });
    return () => {
      hotkeys.unbind(getShortcutKeys().TOOGLE_CAMERA);
    };
  }, [cameraOnClick, isHotkeyEnable, dispatch]);

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
            (isCameraTurnedOn ? CAMERA_TOOL_TIP_ACTIVE : CAMERA_TOOL_TIP_MUTED),
        }}
      ></span>
    );
  };

  const getAriaLabelText = () => {
    return `${selectedCamera?.name} ${
      isCameraTurnedOn ? CAMERA_TOOL_TIP_ACTIVE : CAMERA_TOOL_TIP_MUTED
    }`.replaceAll("<br>", "");
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

  useEffect(() => {
    if (isTooltipOpen) {
      document
        .querySelector(".camera-tooltip .bp5-popover-content")
        ?.setAttribute("role", "alert");
    } else {
      document
        .querySelector(".camera-tooltip .bp5-popover-content")
        ?.removeAttribute("role");
    }
  }, [isTooltipOpen]);

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
        popoverClassName="camera-tooltip"
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
          ariaLabel={getAriaLabelText()}
        />
      </Tooltip>
      <DeviceMenu
        deviceType="camera"
        menuHeader={t("SELECT_CAMERA")}
        disabled={!cameras.length || isCameraDisabled}
        active={!isButtondisabled}
        deviceMenuStyle={deviceMenuStyle}
        toggleId="guestCameraToggleForMenu"
      >
        <button
          aria-label={getFormattedString(t("DEVICE_MENU_TOGGLE"), t("CAMERA"))}
          aria-haspopup="menu"
          aria-disabled={!cameras.length || isCameraDisabled ? "true" : "false"}
          type="button"
          id="guestCameraToggleForMenu"
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
