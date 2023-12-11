import {
  UPDATE_CAMERAS,
  UPDATE_REMOTE_CAMERAS,
  SET_MICROPHONES,
  UPDATE_MICROPHONES,
  UPDATE_REMOTE_MICROPHONES,
  UPDATE_SPEAKERS,
  UPDATE_REMOTE_SPEAKER,
  ENABLE_CAMERA,
  ENABLE_MICROPHONE,
  ENABLE_SPEAKER,
  DISABLE_CAMERA,
  DISABLE_MICROPHONE,
  DISABLE_SPEAKER,
  SELECT_CAMERA,
  SELECT_MICROPHONE,
  SELECT_SPEAKER,
  CAMERA_TURN_ON,
  CAMERA_TURN_OFF,
  MICROPHONE_TURN_ON,
  MICROPHONE_TURN_OFF,
  SPEAKER_TURN_ON,
  SPEAKER_TURN_OFF,
  CAMERAS_CHANGES_SUBSCRIBE,
  CAMERAS_CHANGES_UNSUBSCRIBE,
  REMOTE_CAMERAS_CHANGES_SUBSCRIBE,
  REMOTE_CAMERAS_CHANGES_UNSUBSCRIBE,
  MICROPHONES_CHANGES_SUBSCRIBE,
  MICROPHONES_CHANGES_UNSUBSCRIBE,
  REMOTE_MICROPHONES_CHANGES_SUBSCRIBE,
  REMOTE_MICROPHONES_CHANGES_UNSUBSCRIBE,
  SPEAKERS_CHANGES_SUBSCRIBE,
  SPEAKERS_CHANGES_UNSUBSCRIBE,
  REMOTE_SPEAKER_CHANGES_SUBSCRIBE,
  REMOTE_SPEAKER_CHANGES_UNSUBSCRIBE,
  CYCLE_CAMERA,
  MICROPHONE_SET_MODERATION_STATE,
  MICROPHONE_RESET_MODERATION_STATE,
  CAMERA_SET_MODERATION_STATE,
  CAMERA_RESET_MODERATION_STATE,
  REGISTER_LOCAL_CAMERA_STREAM_INTERCEPTOR,
  CAMERA_SET_HARDWARE_CHECK_STATE,
  MICROPHONE_SET_HARDWARE_CHECK_STATE,
  SPEAKER_SET_HARDWARE_CHECK_STATE,
  DEVICES_RESET_HARDWARE_CHECK_STATE,
} from "../actions/types/devices";

export const updateCameras = (cameras) => ({
  type: UPDATE_CAMERAS,
  cameras,
});

export const updateRemoteCameras = (remoteCameras) => ({
  type: UPDATE_REMOTE_CAMERAS,
  remoteCameras,
});

export const setMicrophones = (microphones) => ({
  type: SET_MICROPHONES,
  microphones,
});

export const updateMicrophones = (microphones) => ({
  type: UPDATE_MICROPHONES,
  microphones,
});

export const updateRemoteMicrophones = (remoteMicrophones) => ({
  type: UPDATE_REMOTE_MICROPHONES,
  remoteMicrophones,
});

export const updateSpeakers = (speakers) => ({
  type: UPDATE_SPEAKERS,
  speakers,
});

export const updateRemoteSpeaker = (speaker) => ({
  type: UPDATE_REMOTE_SPEAKER,
  speaker,
});

export const cameraTurnOn = (payload) => ({
  type: CAMERA_TURN_ON,
  payload,
});

export const cameraTurnOff = (payload) => ({
  type: CAMERA_TURN_OFF,
  payload,
});

export const cycleCamera = (payload) => ({
  type: CYCLE_CAMERA,
  payload,
});

export const subscribeOnCamerasChanges = () => ({
  type: CAMERAS_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromCamerasChanges = () => ({
  type: CAMERAS_CHANGES_UNSUBSCRIBE,
});

export const subscribeOnRemoteCamerasChanges = () => ({
  type: REMOTE_CAMERAS_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromRemoteCamerasChanges = () => ({
  type: REMOTE_CAMERAS_CHANGES_UNSUBSCRIBE,
});

export const microphoneTurnOn = () => ({
  type: MICROPHONE_TURN_ON,
});

export const microphoneTurnOff = () => ({
  type: MICROPHONE_TURN_OFF,
});

export const subscribeOnMicrophonesChanges = () => ({
  type: MICROPHONES_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromMicrophonesChanges = () => ({
  type: MICROPHONES_CHANGES_UNSUBSCRIBE,
});

export const subscribeOnRemoteMicrophonesChanges = () => ({
  type: REMOTE_MICROPHONES_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromRemoteMicrophonesChanges = () => ({
  type: REMOTE_MICROPHONES_CHANGES_UNSUBSCRIBE,
});

export const speakerTurnOn = () => ({
  type: SPEAKER_TURN_ON,
});

export const speakerTurnOff = () => ({
  type: SPEAKER_TURN_OFF,
});

export const subscribeOnSpeakersChanges = () => ({
  type: SPEAKERS_CHANGES_SUBSCRIBE,
});

export const subscribeOnRemoteSpeakerChanges = () => ({
  type: REMOTE_SPEAKER_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromRemoteSpeakerChanges = () => ({
  type: REMOTE_SPEAKER_CHANGES_UNSUBSCRIBE,
});

export const unsubscribeFromSpeakersChanges = () => ({
  type: SPEAKERS_CHANGES_UNSUBSCRIBE,
});

export const selectCamera = (localCamera) => ({
  type: SELECT_CAMERA,
  localCamera,
});

export const selectMicrophone = (localMicrophone) => ({
  type: SELECT_MICROPHONE,
  localMicrophone,
});

export const selectSpeaker = (localSpeaker) => ({
  type: SELECT_SPEAKER,
  localSpeaker,
});

export const disableCamera = (disableReason) => ({
  type: DISABLE_CAMERA,
  disableReason,
});

export const disableMicrophone = (disableReason) => ({
  type: DISABLE_MICROPHONE,
  disableReason,
});

export const disableSpeaker = (disableReason) => ({
  type: DISABLE_SPEAKER,
  disableReason,
});

export const enableCamera = (disableReason) => ({
  type: ENABLE_CAMERA,
  disableReason,
});

export const enableMicrophone = (disableReason) => ({
  type: ENABLE_MICROPHONE,
  disableReason,
});

export const enableSpeaker = (disableReason) => ({
  type: ENABLE_SPEAKER,
  disableReason,
});

export const setMicrophoneModerationState = (type) => ({
  type: MICROPHONE_SET_MODERATION_STATE,
  payload: type,
});

export const resetMicrophoneModerationState = () => ({
  type: MICROPHONE_RESET_MODERATION_STATE,
});

export const setCameraModerationState = (type) => ({
  type: CAMERA_SET_MODERATION_STATE,
  payload: type,
});

export const resetCameraModerationState = () => ({
  type: CAMERA_RESET_MODERATION_STATE,
});
export const registerLocalCameraStreamInterceptor = () => ({
  type: REGISTER_LOCAL_CAMERA_STREAM_INTERCEPTOR,
});
export const setHardwareCheckCameraState = (payload) => ({
  type: CAMERA_SET_HARDWARE_CHECK_STATE,
  payload,
});
export const setHardwareCheckMicrophoneState = (payload) => ({
  type: MICROPHONE_SET_HARDWARE_CHECK_STATE,
  payload,
});
export const setHardwareCheckSpeakerState = (payload) => ({
  type: SPEAKER_SET_HARDWARE_CHECK_STATE,
  payload,
});

export const resetHardwareCheckDevicesState = () => ({
  type: DEVICES_RESET_HARDWARE_CHECK_STATE,
});
