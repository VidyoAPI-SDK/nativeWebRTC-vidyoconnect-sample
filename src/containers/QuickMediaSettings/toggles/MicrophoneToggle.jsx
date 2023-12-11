import React, { useEffect, useRef, useCallback } from "react";
import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { useTranslation } from "react-i18next";
import * as devicesActionCreators from "store/actions/devices";
import * as googleAnalytics from "store/actions/googleAnalytics";
import DeviceToggle from "components/DeviceToggle";
import EnergyLevel from "components/EnergyLevel";
import { test } from "utils/helpers";
import DeviceMenu from "../../DeviceMenu/DeviceMenu";
import { Position, Tooltip } from "@blueprintjs/core";
import { useState } from "react";
import { useModerationStatuses, useIsTouchScreen } from "utils/hooks";
import { deviceDisableReason, deviceTooltipTimeout } from "utils/constants";
import { isMobile } from "react-device-detect";
import OperatingSystemInfoProvider from "utils/deviceDetect";
import { getFormattedString } from "utils/helpers";
import hotkeys from "hotkeys-js";
import useLongHoldkeys from "./../../../hooks/useLongHoldkeys";
import {
  getShortcutKeys,
  getShortcutKeysText,
  keyShortcutsLog,
} from "utils/keyboardShortcuts";

const mapStateToProps = ({ devices, config }) => ({
  microphones: devices.microphones,
  selectedMicrophone: devices.selectedMicrophone,
  isMicrophoneTurnedOn: devices.isMicrophoneTurnedOn,
  isMicrophoneDisabled: devices.isMicrophoneDisabled,
  microphoneMuteControlToggle: config.urlMicrophoneMuteControl.value,
  microphoneModerationState: devices.microphoneModerationState,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators(googleAnalytics, dispatch),
});

let microphoneTooltipTimeout;

const MicrophoneToggle = ({
  microphones,
  selectedMicrophone,
  isMicrophoneDisabled,
  isMicrophoneTurnedOn,
  microphoneTurnOff,
  microphoneTurnOn,
  showLabel,
  rightClickOnDevice,
  microphoneMuteControlToggle,
  showTooltip = true,
  microphoneModerationState,
  tooltipPosition,
  deviceMenuStyle,
  isHotkeyEnable = false,
}) => {
  const { t } = useTranslation();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const showEnergyLevel = false;
  const { isUserAdmin, isUserRoomOwner } = useModerationStatuses();
  const prevState = useRef();
  const dispatch = useDispatch();
  const isTouchScreen =
    useIsTouchScreen() ||
    isMobile ||
    OperatingSystemInfoProvider.IsTabletDevice();
  const microphoneOnClick = useCallback(
    (e) => {
      if (e.target.classList.contains("inactive")) {
        return e.preventDefault();
      }
      isMicrophoneTurnedOn ? microphoneTurnOff() : microphoneTurnOn();
    },
    [isMicrophoneTurnedOn, microphoneTurnOff, microphoneTurnOn]
  );

  const MICROPHONE_TOOL_TIP_ACTIVE = isHotkeyEnable
    ? getShortcutKeysText(
        t("SHORTCUT_MICROPHONE_TOOL_TIP_ACTIVE"),
        getShortcutKeys().TOOGLE_MIC,
        getShortcutKeys().PUSH_TO_TALK
      )
    : t("MICROPHONE_TOOL_TIP_ACTIVE");
  const MICROPHONE_TOOL_TIP_MUTED = isHotkeyEnable
    ? getShortcutKeysText(
        t("SHORTCUT_MICROPHONE_TOOL_TIP_MUTED"),
        getShortcutKeys().TOOGLE_MIC,
        getShortcutKeys().PUSH_TO_TALK
      )
    : t("MICROPHONE_TOOL_TIP_MUTED");

  useEffect(() => {
    hotkeys.filter = function () {
      return isHotkeyEnable;
    };
    hotkeys(getShortcutKeys().TOOGLE_MIC, (e, handler) => {
      e.preventDefault();
      microphoneOnClick(e);
      keyShortcutsLog(`Key pressed - ${handler.key}`);
      dispatch(googleAnalytics.keyboardShortcuts("MIC_TOOGLE"));
    });
    return () => {
      hotkeys.unbind(getShortcutKeys().TOOGLE_MIC);
    };
  }, [microphoneOnClick, isHotkeyEnable, dispatch]);

  const push_to_talk_mic_on = () => {
    microphoneTurnOn();
    keyShortcutsLog(`Key pressed - ${getShortcutKeys().PUSH_TO_TALK}`);
    dispatch(googleAnalytics.keyboardShortcuts("MIC_PUSH_TO_TALK"));
  };

  useLongHoldkeys(
    getShortcutKeys().PUSH_TO_TALK,
    isMicrophoneTurnedOn,
    push_to_talk_mic_on,
    microphoneTurnOff,
    isHotkeyEnable
  );

  const microphoneOnMouseDown = (event) => {
    if (event.nativeEvent.which === 3) {
      rightClickOnDevice("microphone");
    }
  };

  const onMouseEnterButton = () => {
    if (!showTooltip) {
      return;
    }

    if (
      microphoneModerationState?.moderationType ===
        deviceDisableReason.HARD_MUTED &&
      !isUserAdmin &&
      !isUserRoomOwner &&
      microphoneModerationState?.state
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
    setTooltipContent(getMicrophoneStateText());
  };

  const getMicrophoneStateText = () => {
    if (isTouchScreen) return;

    return (
      <span
        dangerouslySetInnerHTML={{
          __html:
            `<b>${selectedMicrophone?.name}</b>` +
            (isMicrophoneTurnedOn
              ? t(MICROPHONE_TOOL_TIP_ACTIVE)
              : t(MICROPHONE_TOOL_TIP_MUTED)),
        }}
      ></span>
    );
  };

  const getAriaLabelText = () => {
    return `${selectedMicrophone?.name} ${
      isMicrophoneTurnedOn
        ? t(MICROPHONE_TOOL_TIP_ACTIVE)
        : t(MICROPHONE_TOOL_TIP_MUTED)
    }`.replaceAll("<br>", "");
  };

  useEffect(() => {
    if (
      microphoneModerationState?.moderationType !==
        deviceDisableReason.HARD_MUTED &&
      microphoneModerationState?.moderationType !==
        deviceDisableReason.SOFT_MUTED
    ) {
      setTooltipContent(getMicrophoneStateText());
    }
    if (
      prevState.current?.moderationType ===
        microphoneModerationState?.moderationType &&
      prevState.current?.state === microphoneModerationState?.state
    ) {
      prevState.current = microphoneModerationState;
      return;
    }

    if (
      microphoneModerationState?.moderationType ===
        deviceDisableReason.HARD_MUTED &&
      !isUserAdmin &&
      !isUserRoomOwner
    ) {
      setTooltipContent(
        !microphoneModerationState?.state
          ? isMicrophoneTurnedOn
            ? ""
            : t("ENABLED_BY_MODERATOR")
          : t("DISABLED_BY_MODERATOR")
      );
      setIsTooltipOpen(true);
    } else if (
      (microphoneModerationState?.moderationType ===
        deviceDisableReason.SOFT_MUTED &&
        microphoneModerationState?.state) ||
      (microphoneModerationState?.moderationType ===
        deviceDisableReason.HARD_MUTED &&
        (isUserAdmin || isUserRoomOwner))
    ) {
      setTooltipContent(
        microphoneModerationState?.state ? (
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

    clearTimeout(microphoneTooltipTimeout);
    microphoneTooltipTimeout = setTimeout(() => {
      setIsTooltipOpen(false);
    }, deviceTooltipTimeout);

    prevState.current = microphoneModerationState;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isUserAdmin,
    isUserRoomOwner,
    microphoneModerationState,
    t,
    isMicrophoneTurnedOn,
    isTouchScreen,
  ]);

  useEffect(() => {
    if (isTooltipOpen) {
      document
        .querySelector(".microphone-tooltip .bp5-popover-content")
        ?.setAttribute("role", "alert");
    } else {
      document
        .querySelector(".microphone-tooltip .bp5-popover-content")
        ?.removeAttribute("role");
    }
  }, [isTooltipOpen]);

  const isButtondisabled =
    microphoneModerationState?.moderationType ===
      deviceDisableReason.HARD_MUTED &&
    !isUserAdmin &&
    !isUserRoomOwner &&
    microphoneModerationState?.state;

  if (!microphoneMuteControlToggle) {
    return null;
  }

  return (
    <div className="device-toggle">
      <Tooltip
        content={tooltipContent}
        isOpen={isTooltipOpen}
        onClosed={onTooltipClosed}
        portalClassName="device-tooltip"
        position={tooltipPosition || Position.TOP_RIGHT}
        disabled={!showTooltip || !tooltipContent || isMicrophoneDisabled}
        popoverClassName="microphone-tooltip"
      >
        <DeviceToggle
          {...test("MICROPHONE_TOGGLE")}
          disabled={
            !microphones.length || !selectedMicrophone || isMicrophoneDisabled
          }
          on={isMicrophoneTurnedOn}
          classList={`microphone ${isButtondisabled ? "inactive" : ""}`}
          onClick={microphoneOnClick}
          onMouseDown={microphoneOnMouseDown}
          onMouseEnter={onMouseEnterButton}
          onMouseLeave={onMouseLeaveButton}
          ariaLabel={getAriaLabelText()}
        >
          {showEnergyLevel && (
            <EnergyLevel
              microphoneId={selectedMicrophone && selectedMicrophone.id}
              isDisabled={!isMicrophoneTurnedOn || isMicrophoneDisabled}
              asIcon={true}
            />
          )}
        </DeviceToggle>
      </Tooltip>
      <DeviceMenu
        deviceType="microphone"
        menuHeader={t("SELECT_MICROPHONE")}
        disabled={!microphones.length || isMicrophoneDisabled}
        active={!isButtondisabled}
        deviceMenuStyle={deviceMenuStyle}
        toggleId="guestMicToggleForMenu"
      >
        <button
          aria-label={getFormattedString(
            t("DEVICE_MENU_TOGGLE"),
            t("MICROPHONE")
          )}
          aria-haspopup="menu"
          aria-disabled={
            !microphones.length || isMicrophoneDisabled ? "true" : "false"
          }
          type="button"
          id="guestMicToggleForMenu"
          className="device-menu-toggle"
          {...test("MICROPHONE_MENU_TOGGLE")}
        />
      </DeviceMenu>
      {showLabel && (
        <div className="device-wrapper">
          <label>{t("MICROPHONE")}</label>
          <div className="toggle-label">
            {isMicrophoneDisabled
              ? t("MICROPHONE_DISABLED")
              : selectedMicrophone
              ? selectedMicrophone.name
              : microphones.length
              ? t("NO_ACTIVE_MICROPHONE")
              : t("NO_MICROPHONE")}
          </div>
        </div>
      )}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MicrophoneToggle);
