import React, { useEffect, useCallback } from "react";
import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { useTranslation } from "react-i18next";
import * as devicesActionCreators from "store/actions/devices";
import * as googleAnalytics from "store/actions/googleAnalytics";
import DeviceToggle from "components/DeviceToggle";
import { test } from "utils/helpers";
import DeviceMenu from "../../DeviceMenu/DeviceMenu";
import SpeakerTestEnergyLevel from "../../../components/EnergyLevel/SpeakerTestEnergyLevel/SpeakerTestEnergyLevel";
import { Tooltip, Position } from "@blueprintjs/core";
import { useIsTouchScreen } from "utils/hooks";
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
  speakers: devices.speakers,
  selectedSpeaker: devices.selectedSpeaker,
  isSpeakerTurnedOn: devices.isSpeakerTurnedOn,
  isSpeakerDisabled: devices.isSpeakerDisabled,
  speakerMuteControlToggle: config.urlShowAudioMuteControl.value,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators(googleAnalytics, dispatch),
});

const SpeakerToggle = ({
  speakers,
  selectedSpeaker,
  isSpeakerDisabled,
  isSpeakerTurnedOn,
  speakerTurnOn,
  speakerTurnOff,
  showLabel,
  rightClickOnDevice,
  showTestSound,
  showTooltip = true,
  tooltipPosition,
  deviceMenuStyle,
  speakerMuteControlToggle,
  isHotkeyEnable = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isTouchScreen =
    useIsTouchScreen() ||
    isMobile ||
    OperatingSystemInfoProvider.IsTabletDevice();
  const speakerOnClick = useCallback(() => {
    isSpeakerTurnedOn ? speakerTurnOff() : speakerTurnOn();
  }, [isSpeakerTurnedOn, speakerTurnOff, speakerTurnOn]);
  const SPEAKER_TOOL_TIP_ACTIVE = isHotkeyEnable
    ? getShortcutKeysText(
        t("SHORTCUT_SPEAKER_TOOL_TIP_ACTIVE"),
        getShortcutKeys().TOOGLE_SPEAKER
      )
    : t("SPEAKER_TOOL_TIP_ACTIVE");
  const SPEAKER_TOOL_TIP_MUTED = isHotkeyEnable
    ? getShortcutKeysText(
        t("SHORTCUT_SPEAKER_TOOL_TIP_MUTED"),
        getShortcutKeys().TOOGLE_SPEAKER
      )
    : t("SPEAKER_TOOL_TIP_MUTED");

  useEffect(() => {
    hotkeys.filter = function () {
      return isHotkeyEnable;
    };
    hotkeys(getShortcutKeys().TOOGLE_SPEAKER, (e, handler) => {
      e.preventDefault();
      speakerOnClick();
      keyShortcutsLog(`Key pressed - ${handler.key}`);
      dispatch(googleAnalytics.keyboardShortcuts("SPEAKER_TOOGLE"));
    });
    return () => {
      hotkeys.unbind(getShortcutKeys().TOOGLE_SPEAKER);
    };
  }, [speakerOnClick, isHotkeyEnable, dispatch]);

  const speakerOnMouseDown = (event) => {
    if (event.nativeEvent.which === 3) {
      rightClickOnDevice("speaker");
    }
  };

  const getSpeakerStateText = () => {
    if (isTouchScreen) return;

    return (
      <span
        dangerouslySetInnerHTML={{
          __html:
            `<b>${selectedSpeaker?.name}</b>` +
            (isSpeakerTurnedOn
              ? SPEAKER_TOOL_TIP_ACTIVE
              : SPEAKER_TOOL_TIP_MUTED),
        }}
      ></span>
    );
  };

  const getAriaLabelText = () => {
    return `${selectedSpeaker?.name} ${
      isSpeakerTurnedOn ? SPEAKER_TOOL_TIP_ACTIVE : SPEAKER_TOOL_TIP_MUTED
    }`.replaceAll("<br>", "");
  };

  if (!speakerMuteControlToggle) {
    return null;
  }

  return (
    <div className="device-toggle">
      <Tooltip
        content={getSpeakerStateText()}
        position={tooltipPosition || Position.TOP}
        portalClassName="device-tooltip"
        disabled={!showTooltip || isSpeakerDisabled}
      >
        <DeviceToggle
          {...test("SPEAKER_TOGGLE")}
          disabled={!speakers.length || !selectedSpeaker || isSpeakerDisabled}
          on={isSpeakerTurnedOn}
          classList="speaker"
          onClick={speakerOnClick}
          onMouseDown={speakerOnMouseDown}
          ariaLabel={getAriaLabelText()}
        >
          {showTestSound &&
            speakers.length &&
            selectedSpeaker &&
            !isSpeakerDisabled && (
              <SpeakerTestEnergyLevel
                speakerId={selectedSpeaker && selectedSpeaker.id}
                isDisabled={!isSpeakerTurnedOn}
                playButtonId="speaker-test-btn"
                labelId="speaker-test-label"
              />
            )}
        </DeviceToggle>
      </Tooltip>
      <DeviceMenu
        deviceType="speaker"
        menuHeader={t("SELECT_SPEAKER")}
        disabled={!speakers.length || isSpeakerDisabled}
        deviceMenuStyle={deviceMenuStyle}
        toggleId="guestSpeakerToggleForMenu"
      >
        <button
          aria-label={getFormattedString(t("DEVICE_MENU_TOGGLE"), t("SPEAKER"))}
          aria-haspopup="menu"
          aria-disabled={
            !speakers.length || isSpeakerDisabled ? "true" : "false"
          }
          type="button"
          id="guestSpeakerToggleForMenu"
          className="device-menu-toggle"
          {...test("SPEAKER_MENU_TOGGLE")}
        />
      </DeviceMenu>
      {showLabel && (
        <div className="toggle-label">
          {showTestSound &&
            speakers.length &&
            selectedSpeaker &&
            !isSpeakerDisabled && (
              <div className="device-wrapper">
                <label>{t("SPEAKER")}</label>
              </div>
            )}
          <span>
            {isSpeakerDisabled
              ? t("SPEAKER_DISABLED")
              : selectedSpeaker
              ? selectedSpeaker.name
              : speakers.length
              ? t("NO_ACTIVE_SPEAKER")
              : t("NO_SPEAKER")}
          </span>
        </div>
      )}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SpeakerToggle);
