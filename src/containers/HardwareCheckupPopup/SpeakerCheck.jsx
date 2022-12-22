import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./HardwareCheckPopup.scss";
import SpeakerEnergyLevel from "./SpeakerEnergyLevel";
import speaker from "assets/images/hardware_check/speaker.svg";
import { isMobile } from "react-device-detect";
import { Classes, MenuItem } from "@blueprintjs/core";
import { useSelector, useDispatch } from "react-redux";
import { isSafari } from "react-device-detect";
import { selectSpeaker } from "store/actions/devices";
import HWTGeneralSelectList from "./HWTGeneralSelectList";
import { test, sortDevices } from "utils/helpers";
import { useSystemDefaultName } from "utils/hooks";
import { Tooltip, Position, Radio, RadioGroup } from "@blueprintjs/core";
import OperatingSystemInfoProvider from "utils/deviceDetect";

const SpeakerCheck = ({ onButtonClick, isVolutanryHardwareCheck }) => {
  const { t } = useTranslation();
  const [speakerState, setSpeakerState] = useState("");
  const [playButtonclass, setPlayButtonclass] = useState("play");

  const selectedSpeaker = useSelector((state) => state.devices.selectedSpeaker);
  const speakers = useSelector((state) => state.devices.speakers);
  const sortedSpeakers = sortDevices(speakers);
  const processName = useSystemDefaultName();
  const dispatch = useDispatch();
  const showDefaultOutputMessage = sortedSpeakers.length === 1 && isSafari;

  const [deviceWorkingStatus, setDeviceWorkingStatus] = useState("");
  const { urlHWTStrictMode } = useSelector((state) => state.config);

  const [afterDelay, setAfterDelay] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setAfterDelay(true);
    }, 1000);
  }, []);

  const onItemSelect = useCallback(
    (localSpeaker) => {
      dispatch(selectSpeaker(localSpeaker));
    },
    [dispatch]
  );

  useEffect(() => {
    if (selectedSpeaker) {
      setDeviceWorkingStatus("");
      setSpeakerState("stop");
      setPlayButtonclass("play");
    } else if (afterDelay) {
      setDeviceWorkingStatus("no");
    }
  }, [selectedSpeaker, afterDelay]);

  const customRenderItem = (item, { index, handleClick }) => (
    <div className="menu-item-wrapper" key={index}>
      <MenuItem
        className={item.selected && Classes.ACTIVE}
        onClick={handleClick}
        text={processName(item)}
        key={index}
        {...test("SELECT_SPEAKER_ITEM")}
      />
      {showDefaultOutputMessage && (
        <div className="default-device-message">
          {t("BROWSER_USES_DEFAULT_DEVICES_MESSAGE")}
        </div>
      )}
    </div>
  );

  const handleDeviceUsageStatus = (deviceStatus) => {
    setDeviceWorkingStatus(deviceStatus);
  };

  return (
    <div className="device-check-cointainer">
      {isMobile || OperatingSystemInfoProvider.IsTabletDevice() ? (
        <div className="mobile-device-list-cointainer">
          <img src={speaker} alt=""></img>
          <span>{t("SPEAKER")}</span>
        </div>
      ) : (
        <div className="device-select-container">
          <HWTGeneralSelectList
            title={t("SPEAKER")}
            icon={speaker}
            disabled={sortedSpeakers.length === 0}
            items={sortedSpeakers}
            customRenderItem={customRenderItem}
            className="hwt-speaker-select"
            onItemSelect={onItemSelect}
            selectedItemName={
              selectedSpeaker
                ? processName(selectedSpeaker)
                : t("NO_ACTIVE_SPEAKER")
            }
            noResultsText={t("NO_SPEAKER")}
            buttonProps={{
              ...test("SELECT_SPEAKER"),
            }}
          />
        </div>
      )}

      <div className="test-speaker">
        <button
          type="button"
          id="sound-test-btn"
          className={playButtonclass}
          onClick={(e) => {
            if (e.target.className === "play") {
              setSpeakerState("play");
              setPlayButtonclass("playing");
            } else {
              setSpeakerState("stop");
              setPlayButtonclass("play");
            }
          }}
        >
          {speakerState === "play" ? t("STOP_TEST_SPEAKER") : t("TEST_SPEAKER")}
        </button>
      </div>
      <div className="output">
        <span className="output-label">{t("OUTPUT_LEVEL")}</span>
        <SpeakerEnergyLevel
          name={speakerState}
          speakerId={selectedSpeaker ? selectedSpeaker.id : null}
          stopSpeaker={() => {
            setSpeakerState("stop");
            setPlayButtonclass("play");
          }}
        ></SpeakerEnergyLevel>
      </div>
      <div className="que-cointainer">
        <p className="lbl">{t("QUE_HEADER_AUDIO")}</p>

        <div className="audio-radio">
          <div className="radio-con">
            <Tooltip
              portalClassName="HWT-tip-tooltip"
              isOpen={
                deviceWorkingStatus === "no" &&
                !isMobile &&
                !OperatingSystemInfoProvider.IsTabletDevice()
              }
              usePortal={false}
              content={
                <span
                  dangerouslySetInnerHTML={{
                    __html: t("HARDWARE_TEST_TIP"),
                  }}
                ></span>
              }
              popoverClassName="hardware-tip"
              position={Position.TOP}
            >
              <RadioGroup
                inline={true}
                disabled={selectedSpeaker === null}
                name="group"
                onChange={(e) => {
                  handleDeviceUsageStatus(e.target.value);
                }}
                selectedValue={deviceWorkingStatus}
              >
                <Radio
                  label={t("YES")}
                  value="yes"
                  {...test("SPEAKER_CHECK_PASSED")}
                />

                <Radio
                  className={"radio-no"}
                  label={t("NO")}
                  value="no"
                  {...test("SPEAKER_CHECK_FAILED")}
                />
              </RadioGroup>
            </Tooltip>
          </div>
        </div>
        <span
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
          disabled={
            deviceWorkingStatus === "" ||
            (deviceWorkingStatus === "no" &&
              urlHWTStrictMode.value &&
              !isVolutanryHardwareCheck) ||
            !afterDelay
          }
          onClick={() => {
            if (onButtonClick) {
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

export default SpeakerCheck;
