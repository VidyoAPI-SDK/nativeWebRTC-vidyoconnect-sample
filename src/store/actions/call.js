import {
  START_CALL,
  END_CALL,
  REJOIN_CALL,
  UPDATE_PARTICIPANTS,
  PARTICIPANTS_CHANGES_SUBSCRIBE,
  PARTICIPANTS_CHANGES_UNSUBSCRIBE,
  LOCAL_WINDOW_SHARES_UPDATE,
  LOCAL_WINDOW_SHARE_CHANGES_SUBSCRIBE,
  LOCAL_WINDOW_SHARE_CHANGES_UNSUBSCRIBE,
  REMOTE_WINDOW_SHARES_UPDATE,
  REMOTE_WINDOW_SHARE_CHANGES_SUBSCRIBE,
  REMOTE_WINDOW_SHARE_CHANGES_UNSUBSCRIBE,
  WINDOW_SHARE_START,
  WINDOW_SHARE_STOP,
  ASSIGN_VIDEO_RENDERER,
  GET_CALL_PROPERTIES,
  RECORDER_STATUS_CHANGES_SUBSCRIBE,
  RECORDER_STATUS_CHANGES_UNSUBSCRIBE,
  RESOURCE_MANAGER_CHANGES_SUBSCRIBE,
  RESOURCE_MANAGER_CHANGES_UNSUBSCRIBE,
  UPDATE_RECORDER_STATUS,
  UPDATE_AVAILIBLE_RESOURCES,
  PIN_PARTICIPANT,
  UNPIN_PARTICIPANT,
  PIN_PARTICIPANT_SUCCEEDED,
  UNPIN_PARTICIPANT_SUCCEEDED,
  OPEN_MODERATION_PANEL,
  CLOSE_MODERATION_PANEL,
  SET_ROOM_INFO,
  RESET_ROOM_INFO,
  LOCK_ROOM,
  UNLOCK_ROOM,
  SAVE_ROOM_PIN,
  MODERATION_EVENTS_UNSUBSCRIBE,
  MODERATION_EVENTS_SUBSCRIBE,
  SAVE_PARTICIPANTS_DETAILS,
  SHOW_PREVIEW,
  COMPOSITOR_UPDATES_SUBSCRIBE,
  COMPOSITOR_UPDATES_UNSUBSCRIBE,
  COMPOSITOR_UPDATED,
  SHOW_SHARE_PREVIEW,
  COMPOSITOR_SET_GRID_VIEW,
  COMPOSITOR_SET_GALLERY_VIEW,
  COMPOSITOR_VIEW_TYPE_CHANGED,
  FECC_PRESETS_SET_TITLE,
  FECC_PRESETS_SELECT_SET_TITLE,
  CC_BTN_SET_STATE,
  CC_SET_INIT_FLAG,
  CC_SET_ANALYTICS,
  CC_SET_IN_PROGRESS,
  SUBSCRIBE_TO_TOPIC,
  UNSUBSCRIBE_FROM_TOPIC,
  MODERATION_TOPIC_UNSUBSCRIBE,
  SET_DISCONNECT_REASON,
  COMPOSITOR_VIEW_CHANGES_UNSUBSCRIBE,
  CAMERA_PRESETS_CHANGES_UNSUBSCRIBE,
  CAMERA_CONTROLS_PANEL_STATE_CHANGES_UNSUBSCRIBE,
} from "./types/call";

export const startCall = (payload) => ({
  type: START_CALL,
  payload,
});

export const getCallProperties = (payload) => ({
  type: GET_CALL_PROPERTIES,
  payload,
});

export const endCall = () => ({
  type: END_CALL,
});

export const rejoinCall = () => ({
  type: REJOIN_CALL,
});

export const subscribeOnParticipantsChanges = () => ({
  type: PARTICIPANTS_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromParticipantsChanges = () => ({
  type: PARTICIPANTS_CHANGES_UNSUBSCRIBE,
});

export const subscribeOnRecorderStatusChanges = () => ({
  type: RECORDER_STATUS_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromRecorderStatusChanges = () => ({
  type: RECORDER_STATUS_CHANGES_UNSUBSCRIBE,
});

export const subscribeOnResourceManagerChanges = () => ({
  type: RESOURCE_MANAGER_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromResourceManagerChanges = () => ({
  type: RESOURCE_MANAGER_CHANGES_UNSUBSCRIBE,
});

export const updateRecorderStatus = (recorderStatus) => ({
  type: UPDATE_RECORDER_STATUS,
  recorderStatus,
});

export const updateAvailableResources = (availibleResources) => ({
  type: UPDATE_AVAILIBLE_RESOURCES,
  availibleResources,
});

export const updateParticipants = (participants) => ({
  type: UPDATE_PARTICIPANTS,
  participants,
});

export const subscribeOnLocalWindowShareChanges = () => ({
  type: LOCAL_WINDOW_SHARE_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromLocalWindowShareChanges = () => ({
  type: LOCAL_WINDOW_SHARE_CHANGES_UNSUBSCRIBE,
});

export const subscribeOnRemoteWindowShareChanges = () => ({
  type: REMOTE_WINDOW_SHARE_CHANGES_SUBSCRIBE,
});

export const unsubscribeFromRemoteWindowShareChanges = () => ({
  type: REMOTE_WINDOW_SHARE_CHANGES_UNSUBSCRIBE,
});

export const updateLocalWindowShares = (localWindowShares) => ({
  type: LOCAL_WINDOW_SHARES_UPDATE,
  localWindowShares,
});

export const updateRemoteWindowShares = (remoteWindowShares) => ({
  type: REMOTE_WINDOW_SHARES_UPDATE,
  remoteWindowShares,
});

export const startWindowShare = (localWindowShare) => ({
  type: WINDOW_SHARE_START,
  localWindowShare,
});

export const stopWindowShare = () => ({
  type: WINDOW_SHARE_STOP,
});

export const assignVideoRenderer = ({ viewId, showAudioMeters }) => ({
  type: ASSIGN_VIDEO_RENDERER,
  payload: {
    showAudioMeters,
    viewId,
  },
});

export const enablePreview = (showPrev) => ({
  type: SHOW_PREVIEW,
  payload: {
    showPrev,
  },
});

export const showSharePreview = (showSharePreview) => ({
  type: SHOW_SHARE_PREVIEW,
  payload: {
    showSharePreview,
  },
});

// for API pinning
export const pinParticipant = (participant) => ({
  type: PIN_PARTICIPANT,
  payload: {
    participant,
    pin: true,
  },
});

// for Local(write to state) pinning
export const pinParticipantSuccess = (participant) => ({
  type: PIN_PARTICIPANT_SUCCEEDED,
  payload: {
    participant,
  },
});

// for API unPinning
export const unpinParticipant = (participant) => ({
  type: UNPIN_PARTICIPANT,
  payload: {
    participant,
    pin: false,
  },
});

export const resetPinParticipant = () => ({
  type: UNPIN_PARTICIPANT_SUCCEEDED,
});

export const openModerationPanel = () => ({
  type: OPEN_MODERATION_PANEL,
});

export const closeModerationPanel = () => ({
  type: CLOSE_MODERATION_PANEL,
});

export const setRoomInfo = (payload) => ({
  type: SET_ROOM_INFO,
  payload,
});

export const resetRoomInfo = () => ({
  type: RESET_ROOM_INFO,
});

export const lockRoom = () => ({
  type: LOCK_ROOM,
});

export const unLockRoom = () => ({
  type: UNLOCK_ROOM,
});

export const saveRoomPin = (payload) => ({
  type: SAVE_ROOM_PIN,
  payload,
});

export const subscribeOnModerationEvents = () => ({
  type: MODERATION_EVENTS_SUBSCRIBE,
});

export const unsubscribeFromModerationEvents = () => ({
  type: MODERATION_EVENTS_UNSUBSCRIBE,
});

export const saveParticipantsDetails = (payload) => ({
  type: SAVE_PARTICIPANTS_DETAILS,
  payload,
});

export const subscribeOnCompositorUpdates = () => ({
  type: COMPOSITOR_UPDATES_SUBSCRIBE,
});

export const unsubscribeFromCompositorUpdates = () => ({
  type: COMPOSITOR_UPDATES_UNSUBSCRIBE,
});

export const compositorUpdated = (compositorTiles) => ({
  type: COMPOSITOR_UPDATED,
  compositorTiles,
});

export const compositorViewChanged = (payload) => ({
  type: COMPOSITOR_VIEW_TYPE_CHANGED,
  payload,
});

export const setCompositorGridView = () => ({
  type: COMPOSITOR_SET_GRID_VIEW,
});

export const setCompositorGalleryView = () => ({
  type: COMPOSITOR_SET_GALLERY_VIEW,
});

export const setFeccPresetsLabel = (label) => ({
  type: FECC_PRESETS_SET_TITLE,
  payload: label,
});

export const setFeccPresetsSelectLabel = (label) => ({
  type: FECC_PRESETS_SELECT_SET_TITLE,
  payload: label,
});

export const setCcBtnIsActive = (isActive) => ({
  type: CC_BTN_SET_STATE,
  payload: isActive,
});

export const setCcInialized = (isInitialized) => ({
  type: CC_SET_INIT_FLAG,
  payload: isInitialized,
});

export const setCcSendAnalytics = (isSend) => ({
  type: CC_SET_ANALYTICS,
  payload: isSend,
});

export const setCcRequestInProgress = (inProgress) => ({
  type: CC_SET_IN_PROGRESS,
  payload: inProgress,
});

export const subscribeToTopic = (params) => ({
  type: SUBSCRIBE_TO_TOPIC,
  payload: params,
});

export const unsubscribeFromTopic = (params) => ({
  type: UNSUBSCRIBE_FROM_TOPIC,
  payload: params,
});

export const unsubscribeFromModerationTopic = () => ({
  type: MODERATION_TOPIC_UNSUBSCRIBE,
});

export const setDisconnectReason = (reason) => ({
  type: SET_DISCONNECT_REASON,
  payload: reason,
});

export const unsubscribeFromCompositorViewChanges = () => ({
  type: COMPOSITOR_VIEW_CHANGES_UNSUBSCRIBE,
});

export const unsubscribeFromCameraPresetsChanges = () => ({
  type: CAMERA_PRESETS_CHANGES_UNSUBSCRIBE,
});

export const unsubscribeFromCameraControlPanelChanges = () => ({
  type: CAMERA_CONTROLS_PANEL_STATE_CHANGES_UNSUBSCRIBE,
});
