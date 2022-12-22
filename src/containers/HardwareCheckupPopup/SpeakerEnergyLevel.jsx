import React, {
  useCallback,
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
} from "react";
import ReactShadowRoot from "react-shadow-root";
import testAudio from "./../../assets/audio/outgoing_call.mp3";
import Alert from "components/Alert";
import { useTranslation } from "react-i18next";
const SpeakerEnergyLevel = ({
  name,
  stopSpeaker,
  microPhoneState,
  microPhoneId,
  recordingAudioElement,
  recordingStream,
  speakerId,
}) => {
  const styles = `:host {
        display: block;
      }
      :host([hidden]) {
        display: none;
      }
      :host([disabled]) {
        opacity: 0.4;
      }
      .enc {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .enc-item {
    width: 6px;
    height: 6px;
    background: #E8EBED;
    transition: all 300ms linear;
    border-radius: 4px;
  }

      :host([level="1"]) .enc-item:nth-child(1),
      :host([level="2"]) .enc-item:nth-child(1),
      :host([level="2"]) .enc-item:nth-child(2),
      :host([level="3"]) .enc-item:nth-child(1),
      :host([level="3"]) .enc-item:nth-child(2),
      :host([level="3"]) .enc-item:nth-child(3),
      :host([level="4"]) .enc-item:nth-child(1),
      :host([level="4"]) .enc-item:nth-child(2),
      :host([level="4"]) .enc-item:nth-child(3),
      :host([level="4"]) .enc-item:nth-child(4),
      :host([level="5"]) .enc-item:nth-child(1),
      :host([level="5"]) .enc-item:nth-child(2),
      :host([level="5"]) .enc-item:nth-child(3),
      :host([level="5"]) .enc-item:nth-child(4),
      :host([level="5"]) .enc-item:nth-child(5),
      :host([level="6"]) .enc-item:nth-child(1),
      :host([level="6"]) .enc-item:nth-child(2),
      :host([level="6"]) .enc-item:nth-child(3),
      :host([level="6"]) .enc-item:nth-child(4),
      :host([level="6"]) .enc-item:nth-child(5),
      :host([level="6"]) .enc-item:nth-child(6),
      :host([level="7"]) .enc-item:nth-child(1),
      :host([level="7"]) .enc-item:nth-child(2),
      :host([level="7"]) .enc-item:nth-child(3),
      :host([level="7"]) .enc-item:nth-child(4),
      :host([level="7"]) .enc-item:nth-child(5),
      :host([level="7"]) .enc-item:nth-child(6),
      :host([level="7"]) .enc-item:nth-child(7),
      :host([level="8"]) .enc-item:nth-child(1),
      :host([level="8"]) .enc-item:nth-child(2),
      :host([level="8"]) .enc-item:nth-child(3),
      :host([level="8"]) .enc-item:nth-child(4),
      :host([level="8"]) .enc-item:nth-child(5),
      :host([level="8"]) .enc-item:nth-child(6),
      :host([level="8"]) .enc-item:nth-child(7),
      :host([level="8"]) .enc-item:nth-child(8),
      :host([level="9"]) .enc-item:nth-child(1),
      :host([level="9"]) .enc-item:nth-child(2),
      :host([level="9"]) .enc-item:nth-child(3),
      :host([level="9"]) .enc-item:nth-child(4),
      :host([level="9"]) .enc-item:nth-child(5),
      :host([level="9"]) .enc-item:nth-child(6),
      :host([level="9"]) .enc-item:nth-child(7),
      :host([level="9"]) .enc-item:nth-child(8),
      :host([level="9"]) .enc-item:nth-child(9),
      :host([level="10"]) .enc-item:nth-child(1),
      :host([level="10"]) .enc-item:nth-child(2),
      :host([level="10"]) .enc-item:nth-child(3),
      :host([level="10"]) .enc-item:nth-child(4),
      :host([level="10"]) .enc-item:nth-child(5),
      :host([level="10"]) .enc-item:nth-child(6),
      :host([level="10"]) .enc-item:nth-child(7),
      :host([level="10"]) .enc-item:nth-child(8),
      :host([level="10"]) .enc-item:nth-child(9),
      :host([level="10"]) .enc-item:nth-child(10),
      :host([level="11"]) .enc-item:nth-child(1),
      :host([level="11"]) .enc-item:nth-child(2),
      :host([level="11"]) .enc-item:nth-child(3),
      :host([level="11"]) .enc-item:nth-child(4),
      :host([level="11"]) .enc-item:nth-child(5),
      :host([level="11"]) .enc-item:nth-child(6),
      :host([level="11"]) .enc-item:nth-child(7),
      :host([level="11"]) .enc-item:nth-child(8),
      :host([level="11"]) .enc-item:nth-child(9),
      :host([level="11"]) .enc-item:nth-child(10),
      :host([level="11"]) .enc-item:nth-child(11),
      :host([level="12"]) .enc-item:nth-child(1),
      :host([level="12"]) .enc-item:nth-child(2),
      :host([level="12"]) .enc-item:nth-child(3),
      :host([level="12"]) .enc-item:nth-child(4),
      :host([level="12"]) .enc-item:nth-child(5),
      :host([level="12"]) .enc-item:nth-child(6),
      :host([level="12"]) .enc-item:nth-child(7),
      :host([level="12"]) .enc-item:nth-child(8),
      :host([level="12"]) .enc-item:nth-child(9),
      :host([level="12"]) .enc-item:nth-child(10),
      :host([level="12"]) .enc-item:nth-child(11),
  :host([level="12"]) .enc-item:nth-child(12),
  :host([level="13"]) .enc-item:nth-child(1),
  :host([level="13"]) .enc-item:nth-child(2),
  :host([level="13"]) .enc-item:nth-child(3),
  :host([level="13"]) .enc-item:nth-child(4),
  :host([level="13"]) .enc-item:nth-child(5),
  :host([level="13"]) .enc-item:nth-child(6),
  :host([level="13"]) .enc-item:nth-child(7),
  :host([level="13"]) .enc-item:nth-child(8),
  :host([level="13"]) .enc-item:nth-child(9),
  :host([level="13"]) .enc-item:nth-child(10),
  :host([level="13"]) .enc-item:nth-child(11),
  :host([level="13"]) .enc-item:nth-child(12),
  :host([level="13"]) .enc-item:nth-child(13),
  :host([level="14"]) .enc-item:nth-child(1),
  :host([level="14"]) .enc-item:nth-child(2),
  :host([level="14"]) .enc-item:nth-child(3),
  :host([level="14"]) .enc-item:nth-child(4),
  :host([level="14"]) .enc-item:nth-child(5),
  :host([level="14"]) .enc-item:nth-child(6),
  :host([level="14"]) .enc-item:nth-child(7),
  :host([level="14"]) .enc-item:nth-child(8),
  :host([level="14"]) .enc-item:nth-child(9),
  :host([level="14"]) .enc-item:nth-child(10),
  :host([level="14"]) .enc-item:nth-child(11),
  :host([level="14"]) .enc-item:nth-child(12),
  :host([level="14"]) .enc-item:nth-child(13),
  :host([level="14"]) .enc-item:nth-child(14),
  :host([level="15"]) .enc-item:nth-child(1),
  :host([level="15"]) .enc-item:nth-child(2),
  :host([level="15"]) .enc-item:nth-child(3),
  :host([level="15"]) .enc-item:nth-child(4),
  :host([level="15"]) .enc-item:nth-child(5),
  :host([level="15"]) .enc-item:nth-child(6),
  :host([level="15"]) .enc-item:nth-child(7),
  :host([level="15"]) .enc-item:nth-child(8),
  :host([level="15"]) .enc-item:nth-child(9),
  :host([level="15"]) .enc-item:nth-child(10),
  :host([level="15"]) .enc-item:nth-child(11),
  :host([level="15"]) .enc-item:nth-child(12),
  :host([level="15"]) .enc-item:nth-child(13),
  :host([level="15"]) .enc-item:nth-child(14),
  :host([level="15"]) .enc-item:nth-child(15),
  :host([level="16"]) .enc-item:nth-child(1),
  :host([level="16"]) .enc-item:nth-child(2),
  :host([level="16"]) .enc-item:nth-child(3),
  :host([level="16"]) .enc-item:nth-child(4),
  :host([level="16"]) .enc-item:nth-child(5),
  :host([level="16"]) .enc-item:nth-child(6),
  :host([level="16"]) .enc-item:nth-child(7),
  :host([level="16"]) .enc-item:nth-child(8),
  :host([level="16"]) .enc-item:nth-child(9),
  :host([level="16"]) .enc-item:nth-child(10),
  :host([level="16"]) .enc-item:nth-child(11),
  :host([level="16"]) .enc-item:nth-child(12),
  :host([level="16"]) .enc-item:nth-child(13),
  :host([level="16"]) .enc-item:nth-child(14),
  :host([level="16"]) .enc-item:nth-child(15),
  :host([level="16"]) .enc-item:nth-child(16),
  :host([level="17"]) .enc-item:nth-child(1),
  :host([level="17"]) .enc-item:nth-child(2),
  :host([level="17"]) .enc-item:nth-child(3),
  :host([level="17"]) .enc-item:nth-child(4),
  :host([level="17"]) .enc-item:nth-child(5),
  :host([level="17"]) .enc-item:nth-child(6),
  :host([level="17"]) .enc-item:nth-child(7),
  :host([level="17"]) .enc-item:nth-child(8),
  :host([level="17"]) .enc-item:nth-child(9),
  :host([level="17"]) .enc-item:nth-child(10),
  :host([level="17"]) .enc-item:nth-child(11),
  :host([level="17"]) .enc-item:nth-child(12),
  :host([level="17"]) .enc-item:nth-child(13),
  :host([level="17"]) .enc-item:nth-child(14),
  :host([level="17"]) .enc-item:nth-child(15),
  :host([level="17"]) .enc-item:nth-child(16),
  :host([level="17"]) .enc-item:nth-child(17),
  :host([level="18"]) .enc-item:nth-child(1),
  :host([level="18"]) .enc-item:nth-child(2),
  :host([level="18"]) .enc-item:nth-child(3),
  :host([level="18"]) .enc-item:nth-child(4),
  :host([level="18"]) .enc-item:nth-child(5),
  :host([level="18"]) .enc-item:nth-child(6),
  :host([level="18"]) .enc-item:nth-child(7),
  :host([level="18"]) .enc-item:nth-child(8),
  :host([level="18"]) .enc-item:nth-child(9),
  :host([level="18"]) .enc-item:nth-child(10),
  :host([level="18"]) .enc-item:nth-child(11),
  :host([level="18"]) .enc-item:nth-child(12),
  :host([level="18"]) .enc-item:nth-child(13),
  :host([level="18"]) .enc-item:nth-child(14),
  :host([level="18"]) .enc-item:nth-child(15),
  :host([level="18"]) .enc-item:nth-child(16),
  :host([level="18"]) .enc-item:nth-child(17),
  :host([level="18"]) .enc-item:nth-child(18),
  :host([level="19"]) .enc-item:nth-child(1),
  :host([level="19"]) .enc-item:nth-child(2),
  :host([level="19"]) .enc-item:nth-child(3),
  :host([level="19"]) .enc-item:nth-child(4),
  :host([level="19"]) .enc-item:nth-child(5),
  :host([level="19"]) .enc-item:nth-child(6),
  :host([level="19"]) .enc-item:nth-child(7),
  :host([level="19"]) .enc-item:nth-child(8),
  :host([level="19"]) .enc-item:nth-child(9),
  :host([level="19"]) .enc-item:nth-child(10),
  :host([level="19"]) .enc-item:nth-child(11),
  :host([level="19"]) .enc-item:nth-child(12),
  :host([level="19"]) .enc-item:nth-child(13),
  :host([level="19"]) .enc-item:nth-child(14),
  :host([level="19"]) .enc-item:nth-child(15),
  :host([level="19"]) .enc-item:nth-child(16),
  :host([level="19"]) .enc-item:nth-child(17),
  :host([level="19"]) .enc-item:nth-child(18),
  :host([level="19"]) .enc-item:nth-child(18)
  {
          background: #20C004;
          transition: none;
      }`;

  const { t } = useTranslation();
  let [permissionError, setPermissionError] = useState(false);
  let interval = useRef(-1);
  let levels = useRef([40]);
  let audioElement = useRef(new Audio(testAudio));
  let isDisabled = useRef(false);
  let audioContext = useRef();
  let analyser = useRef();
  let microphone = useRef();
  let javascriptNode = useRef();
  let microphoneLevel = useRef([]);
  let microPhoneRecordingState = useRef("");
  let recordingStartTime = useRef(0);
  let recordingEndTime = useRef(0);
  let speakerState = useRef();
  let currentSpeakerId = useRef();
  let isComponentVisible = useRef(true);
  const setLevel = (level) => {
    if (document.getElementById("energy-level")) {
      document.getElementById("energy-level").setAttribute("level", level);
    }
  };
  const resetSpeakerAnimation = useCallback(() => {
    setLevel(0);
    levels.current = [40];
    window.clearInterval(interval.current);
  }, [levels, interval]);

  const enable = useCallback(() => {
    isDisabled.current = false;
  }, []);

  const onChange = useCallback((level) => {
    levels.current.push(level);
    let max = Math.max.apply(null, levels.current);
    if (level === max) {
      setLevel(12);
    } else {
      setLevel(Math.round((12 * level) / max));
    }
  }, []);

  const startSpeakerAnimation = useCallback(
    (audioElementTag) => {
      let audioDuration = audioElementTag.duration * 1000;
      let animationLvlArr = [
        7, 23, 22, 26, 25, 35, 34, 32, 32, 30, 32, 30, 29, 27, 28, 27, 26, 25,
        24, 22, 21, 20, 19, 18, 17, 16, 16, 15, 14, 13, 13, 12, 12, 11, 12, 11,
        11, 10, 12, 11, 10, 10, 9, 13, 13, 16, 14, 16, 14, 15, 14, 13, 16, 14,
        14, 13, 13, 12, 12, 11, 10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 6, 5, 5, 5, 5,
        5, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 5, 4, 5, 4, 5, 4, 4,
      ];
      if (microphoneLevel.current.length > 0) {
        animationLvlArr = microphoneLevel.current;
        audioDuration = recordingEndTime.current - recordingStartTime.current;
      }
      let i = 0;
      audioElementTag.onplay = () => {
        interval.current = window.setInterval(() => {
          if (i >= animationLvlArr.length) clearInterval(interval.current);
          onChange(animationLvlArr[i] || 0);
          i++;
        }, audioDuration / animationLvlArr.length);
      };
    },
    [interval, onChange]
  );

  const stopTestSong = useCallback(() => {
    if (audioElement.current) {
      audioElement.current.pause();
      audioElement.current.currentTime = 0;
      if (isComponentVisible.current && stopSpeaker) {
        stopSpeaker();
      }
      resetSpeakerAnimation();
    } else {
      console.log(`Speaker test audio element not found`);
    }
  }, [audioElement, resetSpeakerAnimation, stopSpeaker]);

  const disable = useCallback(() => {
    isDisabled.current = true;
    stopTestSong();
  }, [stopTestSong]);

  const playTestSong = useCallback(() => {
    if (audioElement.current) {
      startSpeakerAnimation(audioElement.current);
      audioElement.current.onended = () => {
        stopTestSong();
      };
      audioElement.current.onpause = () => {
        stopTestSong();
      };
      audioElement.current.onerror = () => {
        stopTestSong();
      };
      audioElement.current.onloadstart = () => {
        // before setSinkId we reload audioElement in func connectAudioWithDevice and we need to reset animation and buttons state
        audioElement.current.onloadstart = null;
        stopTestSong();
      };
      audioElement.current.play().catch(() => {
        setPermissionError(true);
      });
    } else {
      console.log(`Speaker test audio element not found, skip testing speaker`);
    }
  }, [audioElement, startSpeakerAnimation, stopTestSong]);

  const startMicrophoneListening = useCallback(() => {
    console.log(`Start MicrophoneEnergy change detection for ${microPhoneId}`);
    recordingStartTime.current = new Date();
    let streamPromise = recordingStream
      ? Promise.resolve(recordingStream)
      : navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            deviceId: microPhoneId,
          },
        });
    streamPromise
      .then((mediaStream) => {
        audioContext.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        microphone.current =
          audioContext.current.createMediaStreamSource(mediaStream);
        javascriptNode.current = audioContext.current.createScriptProcessor(
          2048,
          1,
          1
        );
        analyser.current.smoothingTimeConstant = 0.8;
        analyser.current.fftSize = 1024;
        microphone.current.connect(analyser.current);
        analyser.current.connect(javascriptNode.current);
        javascriptNode.current.connect(audioContext.current.destination);
        javascriptNode.current.onaudioprocess = () => {
          if (analyser.current === null) {
            return;
          }
          const array = new Uint8Array(analyser.current.frequencyBinCount);
          analyser.current.getByteFrequencyData(array);
          let values = 0;

          let length = array.length;
          for (let i = 0; i < length; i++) {
            values += array[i];
          }
          let average = values / length;
          microphoneLevel.current.push(average);
          onChange(average);
        };
      })
      .catch(function (err) {
        console.error(err);
      });
  }, [microPhoneId, recordingStream, onChange]);

  const stopMicroPhoneListening = useCallback(() => {
    recordingEndTime.current = new Date();
    analyser.current && analyser.current.disconnect();
    microphone.current && microphone.current.disconnect();
    javascriptNode.current && javascriptNode.current.disconnect();
    audioContext.current && audioContext.current.close();
    onChange(0);
    analyser.current = null;
    microphone.current = null;
    javascriptNode.current = null;
    audioContext.current = null;
  }, [onChange]);

  useLayoutEffect(() => {
    if (speakerState.current !== name) {
      if (name === "disabled") {
        disable();
      }
      if (name === "enable") {
        enable();
      }
      if (name === "play") {
        setTimeout(() => playTestSong(), 200);
      }

      if (name === "stop") {
        stopTestSong();
      }
    }
    if (
      microPhoneRecordingState.current !== microPhoneState &&
      microPhoneState === "recording"
    ) {
      startMicrophoneListening();
    }
    if (
      microPhoneRecordingState.current !== microPhoneState &&
      microPhoneState === "recordingStop"
    ) {
      stopMicroPhoneListening();
    }
    if (recordingAudioElement) {
      audioElement.current = recordingAudioElement;
    }
    if (speakerId && currentSpeakerId.current !== speakerId) {
      stopTestSong();
      if (audioElement.current.setSinkId) {
        //Reload audio before setSinkId to avoid issue with no sound after unplugging the active speaker
        audioElement.current.pause();
        audioElement.current.load();
        audioElement.current
          .setSinkId(speakerId)
          .then(() => {
            console.info("Sucessfully attached sinkid for " + speakerId);
          })
          .catch(() => {
            console.error("Error while  attaching sinkid for " + speakerId);
          });
      }
      currentSpeakerId.current = speakerId;
    }
    microPhoneRecordingState.current = microPhoneState;
    speakerState.current = name;
  }, [
    name,
    isDisabled,
    disable,
    enable,
    playTestSong,
    stopTestSong,
    microPhoneState,
    recordingAudioElement,
    startMicrophoneListening,
    stopMicroPhoneListening,
    speakerId,
  ]);

  useEffect(() => {
    return () => {
      if (audioElement.current) {
        audioElement.current.pause();
        resetSpeakerAnimation();
      }
      isComponentVisible.current = false;
      stopMicroPhoneListening();
    };
  }, [isComponentVisible, stopMicroPhoneListening, resetSpeakerAnimation]);

  return (
    <div id={"energy-level"}>
      {permissionError && (
        <Alert
          className="tap-to-play-message"
          message={{
            text: t("TAP_TO_PLAY_RECORDING"),
          }}
          buttonText={t("OK")}
          onConfirm={() => {
            setPermissionError(false);
            audioElement.current.play();
          }}
          isOpen={true}
        />
      )}
      <ReactShadowRoot>
        <style>{styles}</style>
        <div className="enc">
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
          <div className="enc-item"></div>
        </div>
      </ReactShadowRoot>
    </div>
  );
};

export default SpeakerEnergyLevel;
