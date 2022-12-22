import {
  UPDATE_CAMERAS,
  UPDATE_REMOTE_CAMERAS,
  SET_MICROPHONES,
  UPDATE_MICROPHONES,
  UPDATE_REMOTE_SPEAKER,
  UPDATE_REMOTE_MICROPHONES,
  UPDATE_SPEAKERS,
  ENABLE_CAMERA,
  ENABLE_MICROPHONE,
  ENABLE_SPEAKER,
  DISABLE_CAMERA,
  DISABLE_CAMERA_FAILED,
  DISABLE_CAMERA_SUCCEEDED,
  DISABLE_MICROPHONE,
  DISABLE_MICROPHONE_FAILED,
  DISABLE_MICROPHONE_SUCCEEDED,
  DISABLE_SPEAKER,
  DISABLE_SPEAKER_FAILED,
  DISABLE_SPEAKER_SUCCEEDED,
  SELECT_CAMERA,
  SELECT_CAMERA_FAILED,
  SELECT_CAMERA_SUCCEEDED,
  SELECT_MICROPHONE,
  SELECT_MICROPHONE_FAILED,
  SELECT_MICROPHONE_SUCCEEDED,
  SELECT_SPEAKER,
  SELECT_SPEAKER_FAILED,
  SELECT_SPEAKER_SUCCEEDED,
  CAMERA_TURN_ON,
  CAMERA_TURN_ON_FAILED,
  CAMERA_TURN_ON_SUCCEEDED,
  CAMERA_TURN_OFF,
  CAMERA_TURN_OFF_FAILED,
  CAMERA_TURN_OFF_SUCCEEDED,
  MICROPHONE_TURN_ON,
  MICROPHONE_TURN_ON_FAILED,
  MICROPHONE_TURN_ON_SUCCEEDED,
  MICROPHONE_TURN_OFF,
  MICROPHONE_TURN_OFF_FAILED,
  MICROPHONE_TURN_OFF_SUCCEEDED,
  SPEAKER_TURN_ON,
  SPEAKER_TURN_ON_FAILED,
  SPEAKER_TURN_ON_SUCCEEDED,
  SPEAKER_TURN_OFF,
  SPEAKER_TURN_OFF_FAILED,
  SPEAKER_TURN_OFF_SUCCEEDED,
  CAMERA_SET_MODERATION_STATE,
  CAMERA_RESET_MODERATION_STATE,
  MICROPHONE_SET_MODERATION_STATE,
  MICROPHONE_RESET_MODERATION_STATE,
  CAMERA_SET_HARDWARE_CHECK_STATE,
  MICROPHONE_SET_HARDWARE_CHECK_STATE,
  SPEAKER_SET_HARDWARE_CHECK_STATE,
  DEVICES_RESET_HARDWARE_CHECK_STATE,
} from "../actions/types/devices";

const initialState = {
  cameras: [],
  remoteCameras: [],
  microphones: [],
  remoteMicrophones: [],
  speakers: [],
  remoteSpeaker: null,
  isCameraDisabled: false,
  isCameraTurnedOn: true,
  cameraDisableReasons: [],
  cameraStateChanging: false,
  cameraModerationState: {},
  isMicrophoneDisabled: false,
  isMicrophoneTurnedOn: true,
  microphoneDisableReasons: [],
  microphoneModerationState: {},
  microphoneStateChanging: false,
  isSpeakerDisabled: false,
  isSpeakerTurnedOn: true,
  speakerDisableReasons: [],
  speakerStateChanging: false,
  selectedCamera: null,
  selectedMicrophone: null,
  selectedSpeaker: null,
  hardwareCheckCameraState: {},
  hardwareCheckMicrophoneState: {},
  hardwareCheckSpeakerState: {},
};

const devices = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CAMERAS: {
      const selectedCamera = action.cameras.find((d) => d.selected);
      return {
        ...state,
        cameras: [...action.cameras],
        selectedCamera: selectedCamera ? { ...selectedCamera } : null,
      };
    }

    case UPDATE_REMOTE_CAMERAS:
      return {
        ...state,
        remoteCameras: [...action.remoteCameras],
      };

    case SET_MICROPHONES:
    case UPDATE_MICROPHONES: {
      const selectMicrophone = action.microphones.find((d) => d.selected);
      return {
        ...state,
        microphones: [...action.microphones],
        selectedMicrophone: selectMicrophone ? { ...selectMicrophone } : null,
      };
    }

    case UPDATE_REMOTE_MICROPHONES:
      return {
        ...state,
        remoteMicrophones: [...action.remoteMicrophones],
      };

    case UPDATE_SPEAKERS: {
      const selectedSpeaker = action.speakers.find((d) => d.selected);
      return {
        ...state,
        speakers: [...action.speakers],
        selectedSpeaker: selectedSpeaker ? { ...selectedSpeaker } : null,
      };
    }

    case UPDATE_REMOTE_SPEAKER:
      return {
        ...state,
        remoteSpeaker: action.speaker,
      };

    case ENABLE_CAMERA: {
      const cameraDisableReasons = state.cameraDisableReasons.filter(
        (reason) => reason !== action.disableReason
      );
      return {
        ...state,
        cameraDisableReasons,
        isCameraDisabled: !!cameraDisableReasons.length,
      };
    }

    case ENABLE_MICROPHONE: {
      const microphoneDisableReasons = state.microphoneDisableReasons.filter(
        (reason) => reason !== action.disableReason
      );
      return {
        ...state,
        microphoneDisableReasons,
        isMicrophoneDisabled: !!microphoneDisableReasons.length,
      };
    }

    case ENABLE_SPEAKER: {
      const speakerDisableReasons = state.speakerDisableReasons.filter(
        (reason) => reason !== action.disableReason
      );
      return {
        ...state,
        speakerDisableReasons,
        isSpeakerDisabled: !!speakerDisableReasons.length,
      };
    }

    case DISABLE_CAMERA:
      return {
        ...state,
        cameraStateChanging: true,
      };

    case DISABLE_CAMERA_SUCCEEDED: {
      const cameraDisableReasons = new Set([
        ...state.cameraDisableReasons,
        action.disableReason,
      ]);
      return {
        ...state,
        isCameraDisabled: true,
        cameraStateChanging: false,
        cameraDisableReasons: [...cameraDisableReasons],
      };
    }

    case DISABLE_CAMERA_FAILED:
      return {
        ...state,
        cameraStateChanging: false,
      };

    case DISABLE_MICROPHONE:
      return {
        ...state,
        microphoneStateChanging: true,
      };

    case DISABLE_MICROPHONE_SUCCEEDED: {
      const microphoneDisableReasons = new Set([
        ...state.microphoneDisableReasons,
        action.disableReason,
      ]);
      return {
        ...state,
        isMicrophoneDisabled: true,
        microphoneStateChanging: false,
        microphoneDisableReasons: [...microphoneDisableReasons],
      };
    }

    case DISABLE_MICROPHONE_FAILED:
      return {
        ...state,
        microphoneStateChanging: false,
      };

    case DISABLE_SPEAKER:
      return {
        ...state,
        speakerStateChanging: true,
      };

    case DISABLE_SPEAKER_SUCCEEDED:
      return {
        ...state,
        isSpeakerDisabled: true,
        speakerStateChanging: false,
        speakerDisableReasons: [
          ...state.speakerDisableReasons,
          action.disableReason,
        ],
      };

    case DISABLE_SPEAKER_FAILED:
      return {
        ...state,
        speakerStateChanging: false,
      };

    case SELECT_CAMERA:
      return {
        ...state,
        cameraStateChanging: true,
      };

    case SELECT_CAMERA_SUCCEEDED:
    case SELECT_CAMERA_FAILED:
      return {
        ...state,
        cameraStateChanging: false,
      };

    case SELECT_MICROPHONE:
      return {
        ...state,
        microphoneStateChanging: true,
      };

    case SELECT_MICROPHONE_SUCCEEDED:
    case SELECT_MICROPHONE_FAILED:
      return {
        ...state,
        microphoneStateChanging: false,
      };

    case SELECT_SPEAKER:
      return {
        ...state,
        speakerStateChanging: true,
      };

    case SELECT_SPEAKER_SUCCEEDED:
    case SELECT_SPEAKER_FAILED:
      return {
        ...state,
        speakerStateChanging: false,
      };

    case CAMERA_TURN_ON:
      return {
        ...state,
        isCameraTurnedOn: false,
        cameraStateChanging: true,
      };

    case CAMERA_TURN_ON_SUCCEEDED:
      return {
        ...state,
        isCameraTurnedOn: true,
        cameraStateChanging: false,
      };

    case CAMERA_TURN_ON_FAILED:
      return {
        ...state,
        isCameraTurnedOn: false,
        cameraStateChanging: false,
      };

    case CAMERA_TURN_OFF:
      return {
        ...state,
        isCameraTurnedOn: true,
        cameraStateChanging: true,
      };

    case CAMERA_TURN_OFF_SUCCEEDED:
    case CAMERA_TURN_OFF_FAILED:
      return {
        ...state,
        isCameraTurnedOn: false,
        cameraStateChanging: false,
      };

    case MICROPHONE_TURN_ON:
      return {
        ...state,
        isMicrophoneTurnedOn: false,
        microphoneStateChanging: true,
      };

    case MICROPHONE_TURN_ON_SUCCEEDED:
      return {
        ...state,
        isMicrophoneTurnedOn: true,
        microphoneStateChanging: false,
      };

    case MICROPHONE_TURN_ON_FAILED:
      return {
        ...state,
        isMicrophoneTurnedOn: false,
        microphoneStateChanging: false,
      };

    case MICROPHONE_TURN_OFF:
      return {
        ...state,
        isMicrophoneTurnedOn: true,
        microphoneStateChanging: true,
      };

    case MICROPHONE_TURN_OFF_SUCCEEDED:
    case MICROPHONE_TURN_OFF_FAILED:
      return {
        ...state,
        isMicrophoneTurnedOn: false,
        microphoneStateChanging: false,
      };

    case SPEAKER_TURN_ON:
      return {
        ...state,
        isSpeakerTurnedOn: false,
        speakerStateChanging: true,
      };

    case SPEAKER_TURN_ON_SUCCEEDED:
      return {
        ...state,
        isSpeakerTurnedOn: true,
        speakerStateChanging: false,
      };

    case SPEAKER_TURN_ON_FAILED:
      return {
        ...state,
        isSpeakerTurnedOn: false,
        speakerStateChanging: false,
      };

    case SPEAKER_TURN_OFF:
      return {
        ...state,
        isSpeakerTurnedOn: true,
        speakerStateChanging: true,
      };

    case SPEAKER_TURN_OFF_SUCCEEDED:
    case SPEAKER_TURN_OFF_FAILED:
      return {
        ...state,
        isSpeakerTurnedOn: false,
        speakerStateChanging: false,
      };

    case CAMERA_SET_MODERATION_STATE:
      return {
        ...state,
        cameraModerationState: action.payload,
      };

    case CAMERA_RESET_MODERATION_STATE:
      return {
        ...state,
        cameraModerationState: {},
      };

    case MICROPHONE_SET_MODERATION_STATE:
      return {
        ...state,
        microphoneModerationState: action.payload,
      };

    case MICROPHONE_RESET_MODERATION_STATE:
      return {
        ...state,
        microphoneModerationState: {},
      };

    case CAMERA_SET_HARDWARE_CHECK_STATE:
      return {
        ...state,
        hardwareCheckCameraState: action.payload,
      };

    case MICROPHONE_SET_HARDWARE_CHECK_STATE:
      return {
        ...state,
        hardwareCheckMicrophoneState: action.payload,
      };

    case SPEAKER_SET_HARDWARE_CHECK_STATE:
      return {
        ...state,
        hardwareCheckSpeakerState: action.payload,
      };

    case DEVICES_RESET_HARDWARE_CHECK_STATE:
      return {
        ...state,
        hardwareCheckCameraState: {},
        hardwareCheckMicrophoneState: {},
        hardwareCheckSpeakerState: {},
      };

    default:
      return state;
  }
};

export default devices;
