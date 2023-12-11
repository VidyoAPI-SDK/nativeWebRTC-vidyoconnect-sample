import {
  UPDATE_LOCAL_STETHOSCOPES,
  UPDATE_REMOTE_STETHOSCOPES,
  UPDATE_REMOTE_SPEAKER,
  REMOTE_SPEAKER_CHANGES_SUBSCRIBE,
  REMOTE_SPEAKER_CHANGES_UNSUBSCRIBE,
  SELECT_REMOTE_STETHOSCOPE,
  UNSELECT_REMOTE_STETHOSCOPE,
  START_REMOTE_STETHOSCOPE,
  STOP_REMOTE_STETHOSCOPE,
  SELECT_LOCAL_STETHOSCOPE,
  UNSELECT_LOCAL_STETHOSCOPE,
  UNPROCESSED_AUDIO_UPDATES_SUBSCRIBE,
  UNPROCESSED_AUDIO_UPDATES_UNSUBSCRIBE,
} from "./types";

export const updateLocalStethoscopes = (localStethoscopes) => ({
  type: UPDATE_LOCAL_STETHOSCOPES,
  localStethoscopes,
});

export const updateRemoteStethoscopes = (remoteStethoscopes) => ({
  type: UPDATE_REMOTE_STETHOSCOPES,
  remoteStethoscopes,
});

export const updateRemoteSpeaker = (speaker) => ({
  type: UPDATE_REMOTE_SPEAKER,
  speaker,
});

export const subscribeOnRemoteSpeakerChanges = () => ({
  type: REMOTE_SPEAKER_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromRemoteSpeakerChanges = () => ({
  type: REMOTE_SPEAKER_CHANGES_UNSUBSCRIBE,
});

export const selectLocalStethoscope = (localStethoscope) => ({
  type: SELECT_LOCAL_STETHOSCOPE,
  localStethoscope,
});

export const unselectLocalStethoscope = (localStethoscope) => ({
  type: UNSELECT_LOCAL_STETHOSCOPE,
  localStethoscope,
});

export const selectRemoteStethoscope = (remoteStethoscope) => ({
  type: SELECT_REMOTE_STETHOSCOPE,
  remoteStethoscope,
});

export const unselectRemoteStethoscope = () => ({
  type: UNSELECT_REMOTE_STETHOSCOPE,
});

export const startRemoteStethoscope = (remoteStethoscope) => ({
  type: START_REMOTE_STETHOSCOPE,
  remoteStethoscope,
});

export const stopRemoteStethoscope = () => ({
  type: STOP_REMOTE_STETHOSCOPE,
});

export const subscribeOnUnprocessedAudioUpdates = () => ({
  type: UNPROCESSED_AUDIO_UPDATES_SUBSCRIBE,
});

export const unsubscribeFromUnprocessedAudioUpdates = () => ({
  type: UNPROCESSED_AUDIO_UPDATES_UNSUBSCRIBE,
});
