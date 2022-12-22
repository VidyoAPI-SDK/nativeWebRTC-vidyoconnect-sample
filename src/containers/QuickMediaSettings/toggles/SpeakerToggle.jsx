import React from "react";
import { connect } from "react-redux";
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
}) => {
  const { t } = useTranslation();
  const isTouchScreen =
    useIsTouchScreen() ||
    isMobile ||
    OperatingSystemInfoProvider.IsTabletDevice();
  const speakerOnClick = () => {
    isSpeakerTurnedOn ? speakerTurnOff() : speakerTurnOn();
  };

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
              ? t("SPEAKER_TOOL_TIP_ACTIVE")
              : t("SPEAKER_TOOL_TIP_MUTED")),
        }}
      ></span>
    );
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
      >
        <button
          type="button"
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
