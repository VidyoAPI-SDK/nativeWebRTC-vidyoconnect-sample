import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import SpeakerEnergyLevel from "./SpeakerEnergyLevel";
import audioRecorder from "../../utils/audioRecorder";
import mic from "assets/images/hardware_check/microphone.svg";
import { isMobile } from "react-device-detect";
import { Classes, MenuItem } from "@blueprintjs/core";
import { selectMicrophone } from "store/actions/devices";
import HWTGeneralSelectList from "./HWTGeneralSelectList";
import { test, sortDevices } from "utils/helpers";
import { useSystemDefaultName } from "utils/hooks";
import { Tooltip, Position, Radio, RadioGroup } from "@blueprintjs/core";

import "./HardwareCheckPopup.scss";
import OperatingSystemInfoProvider from "utils/deviceDetect";

const MicrophoneCheck = ({ onButtonClick, isVolutanryHardwareCheck }) => {
  const selectedSpeaker = useSelector((state) => state.devices.selectedSpeaker);
  const selectedMicrophone = useSelector(
    (state) => state.devices.selectedMicrophone
  );
  const { t } = useTranslation();
  const [speakerState, setSpeakerState] = useState("");
  const [playButtonclass, setPlayButtonclass] = useState(
    "start-recording-sound"
  );

  let microphoneID = selectedMicrophone ? selectedMicrophone.id : null;
  let recordingTimer = useRef(-1);
  const RECORDING_TIME = 5000;

  const audioMediaConstraints = {
    audio: { deviceId: microphoneID },
    video: false,
  };
  const [recordingAudioElement, setAudioElement] = useState(null);
  const [recordButtonLabel, setRecordLabel] = useState("START_MIC_RECORDING");
  const [microPhoneState, setMicroPhoneState] = useState("");
  let recorder = useRef(null);
  let recorderStream = useRef(null);

  const microphones = useSelector((state) => state.devices.microphones);
  const sortedMicrophones = sortDevices(microphones);
  const processName = useSystemDefaultName();
  const dispatch = useDispatch();
  const [deviceWorkingStatus, setDeviceWorkingStatus] = useState("");
  const { urlHWTStrictMode } = useSelector((state) => state.config);

  const handleDeviceUsageStatus = (deviceStatus) => {
    setDeviceWorkingStatus(deviceStatus);
  };

  const onItemSelect = useCallback(
    (localMicrophone) => {
      dispatch(selectMicrophone(localMicrophone));
    },
    [dispatch]
  );

  useEffect(() => {
    if (selectedMicrophone) {
      setDeviceWorkingStatus("");
      stopRecording(false);
    } else {
      setDeviceWorkingStatus("no");
    }
  }, [selectedMicrophone]);

  const customRenderItem = (item, { index, handleClick }) => (
    <MenuItem
      tabIndex="0"
      aria-selected={item.selected ? "true" : "false"}
      role="option"
      className={item.selected && Classes.ACTIVE}
      onClick={handleClick}
      text={processName(item)}
      key={index}
      {...test("SELECT_MICROPHONE_ITEM")}
    />
  );

  const nextButtonDisabled =
    deviceWorkingStatus === "" ||
    (deviceWorkingStatus === "no" &&
      urlHWTStrictMode.value &&
      !isVolutanryHardwareCheck);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(
      audioMediaConstraints
    );
    recorderStream.current = stream;
    if (selectedSpeaker.id) {
      recorder.current = await audioRecorder(stream, selectedSpeaker.id);
    } else {
      recorder.current = await audioRecorder(stream);
    }
    recorder.current.start();
    setMicroPhoneState("recording");
    clearTimeout(recordingTimer.current);
    recordingTimer.current = setTimeout(stopRecording, RECORDING_TIME);
  };

  const stopRecording = (playRecord = true) => {
    if (!recorder.current) {
      return;
    }
    clearTimeout(recordingTimer.current);
    recorder.current.stop().then((data) => {
      setAudioElement(data.audioElement);
      if (playRecord) {
        setRecordLabel("RECORDING_PLAY");
        setSpeakerState("play");
        setPlayButtonclass("playing");
      } else {
        setRecordLabel("START_MIC_RECORDING");
        setPlayButtonclass("start-recording-sound");
      }
    });
    setMicroPhoneState("recordingStop");
  };

  useEffect(() => {
    return () => {
      clearTimeout(recordingTimer.current);
    };
  }, []);

  return (
    <div className="device-check-cointainer" {...test("MICROPHONE_POPUP")}>
      {isMobile || OperatingSystemInfoProvider.IsTabletDevice() ? (
        <div className="mobile-device-list-cointainer">
          <img src={mic} alt={t("MICROPHONE")}></img>
          <span>{t("MICROPHONE")}</span>
        </div>
      ) : (
        <div className="device-select-container">
          <HWTGeneralSelectList
            title={t("MICROPHONE")}
            icon={mic}
            disabled={selectedMicrophone === null}
            items={sortedMicrophones}
            customRenderItem={customRenderItem}
            className="hwt-speaker-select"
            onItemSelect={onItemSelect}
            selectedItemName={
              selectedMicrophone
                ? processName(selectedMicrophone)
                : t("NO_ACTIVE_MICROPHONE")
            }
            noResultsText={t("NO_MICROPHONE")}
            buttonProps={{
              ...test("SELECT_MICROPHONE"),
            }}
          />
        </div>
      )}

      <div role="region" aria-live="polite" className="test-speaker">
        <button
          type="button"
          id="sound-test-btn"
          disabled={playButtonclass === "playing" || microphoneID === null}
          className={playButtonclass}
          onClick={(e) => {
            if (e.target.className === "start-recording-sound") {
              setPlayButtonclass("stop-recording-sound");
              startRecording();
              setRecordLabel("STOP_MIC_RECORDING");
            } else if (e.target.className === "stop-recording-sound") {
              stopRecording();
            }
          }}
          {...test("HWT_MIC_TEST_BTN")}
        >
          {t(recordButtonLabel)}
        </button>
      </div>
      <div className="output">
        <span className="output-label">{t("INPUT_LEVEL")}</span>
        <SpeakerEnergyLevel
          name={speakerState}
          stopSpeaker={() => {
            setSpeakerState("");
            setPlayButtonclass("start-recording-sound");
            setRecordLabel("START_MIC_RECORDING");
          }}
          microPhoneState={microPhoneState}
          microPhoneId={microphoneID}
          recordingAudioElement={recordingAudioElement}
          recordingStream={recorderStream.current}
        ></SpeakerEnergyLevel>
      </div>
      <div className="que-cointainer">
        <p tabIndex="0" className="lbl">
          {t("QUE_HEADER_AUDIO")}
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
              usePortal={false}
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
            >
              <RadioGroup
                inline={true}
                disabled={selectedMicrophone === null}
                name="group"
                onChange={(e) => {
                  handleDeviceUsageStatus(e.target.value);
                }}
                selectedValue={deviceWorkingStatus}
              >
                <Radio
                  label={t("YES")}
                  value="yes"
                  {...test("MIC_CHECK_PASSED")}
                />

                <Radio
                  className={"radio-no"}
                  label={t("NO")}
                  value="no"
                  {...test("MIC_CHECK_FAILED")}
                />
              </RadioGroup>
            </Tooltip>
          </div>
        </div>
        <span
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

export default MicrophoneCheck;
