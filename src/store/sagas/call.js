import { buffers } from "redux-saga";
import { eventChannel, END } from "redux-saga";
import { put, call, select, takeLatest, delay } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import * as devicesActions from "../actions/devices";
import * as chatActionTypes from "../actions/types/chat";
import * as callActionTypes from "../actions/types/call";
import * as configActionTypes from "../actions/types/config";
import * as googleAnalyticsActions from "../actions/googleAnalytics";
import * as deviceActionTypes from "../actions/types/devices";
import * as callActions from "../actions/call";
import * as configActions from "../actions/config";
import {
  deviceDisableReason,
  participantLimit,
  tabletsGridParticipantLimit,
} from "utils/constants";
import OperatingSystemInfoProvider from "utils/deviceDetect";
import APIClient from "services/APIClient";
import { isCustomParamEnabled } from "utils/helpers";
import VCAPMessageProcessor from "utils/vcapModerationParser";

const callProvider = getCallAPIProvider();

function* handleGeolocation(customParameters) {
  const state = yield select();

  const geolocationServiceURL = !state.user.isRegistered
    ? customParameters?.geolocationServiceURL
    : null;
  if (geolocationServiceURL) {
    yield put(
      configActions.setGeolocationURL({
        geolocationServiceURL,
      })
    );
  } else {
    console.warn("geolocationServiceURL is not available");
  }
}

function* startCall(action) {
  try {
    const state = yield select();
    if (state.config.customParameters) {
      if (
        isCustomParamEnabled(state.config.customParameters?.enableP2PConnection)
      ) {
        yield put(configActions.setP2PConnection({ enabled: true }));
      }
      if (!state.user.isRegistered) {
        yield* handleGeolocation(state.config.customParameters);
      }
    } else {
      try {
        const params = {
          host: state.config.urlPortal.value,
        };
        if (state.user.isRegistered && state.user.userAuthToken) {
          params.authToken = state.user.userAuthToken;
        }
        const customParameters = yield call(
          APIClient.getCustomParameters,
          params
        );
        if (customParameters) {
          if (
            isCustomParamEnabled(
              customParameters.registered
                ? customParameters.registered.enableP2PConnection
                : customParameters.unregistered?.enableP2PConnection
            )
          ) {
            yield put(configActions.setP2PConnection({ enabled: true }));
          }
          yield* handleGeolocation(customParameters);
          yield put({
            type: configActionTypes.GET_CUSTOM_PARAMETERS_SUCCEEDED,
            payload: customParameters,
          });
        }
      } catch (error) {
        console.error(
          "Error while initialize Geolocation:",
          error?.message ?? error
        );
      }
    }
    yield put({ type: callActionTypes.MODERATION_EVENTS_SUBSCRIBE });
    yield put({ type: callActionTypes.RECORDER_STATUS_CHANGES_SUBSCRIBE });
    const callChannel = yield call(createCallChannel, action);
    yield takeLatest(callChannel, handleCallStatus);
  } catch (e) {
    yield put({
      type: callActionTypes.START_CALL_FAILED,
      message: e?.message,
    });
  }
}

function* getCallProperties(action) {
  try {
    const properties = yield callProvider.getCallProperties(action.payload);
    yield put({
      type: callActionTypes.GET_CALL_PROPERTIES_SUCCEEDED,
      properties,
    });
    yield put(googleAnalyticsActions.joinAnalytics("roomlink"));
    yield put(googleAnalyticsActions.joinRoomType("Guest"));
  } catch (e) {
    yield put({
      type: callActionTypes.GET_CALL_PROPERTIES_FAILED,
      message: e?.message,
    });
  }
}

function createCallChannel(action) {
  return eventChannel((emit) => {
    const onDisconnected = (reason, error) => {
      setTimeout(() => {
        emit({ isCallStarted: false, reason, error });
        emit(END);
      });
    };

    callProvider.startCall({ ...action.payload, onDisconnected }).then(() => {
      emit({ isCallStarted: true });
    });

    return () => {};
  });
}

function* handleCallStatus({ isCallStarted, reason, error }) {
  if (isCallStarted) {
    yield put(configActions.getJwtToken());
    yield put({
      type: callActionTypes.START_CALL_SUCCEEDED,
      callStartedTime: new Date().getTime(),
    });
    yield put({ type: callActionTypes.GET_CALL_PROPERTIES });
    yield put({ type: callActionTypes.PARTICIPANTS_CHANGES_SUBSCRIBE });
    yield put({ type: callActionTypes.RESOURCE_MANAGER_CHANGES_SUBSCRIBE });
    yield put({ type: callActionTypes.LOCAL_WINDOW_SHARE_CHANGES_SUBSCRIBE });
    yield put({ type: callActionTypes.REMOTE_WINDOW_SHARE_CHANGES_SUBSCRIBE });
    yield put({ type: deviceActionTypes.REMOTE_CAMERAS_CHANGES_SUBSCRIBE });
    yield put({ type: deviceActionTypes.REMOTE_MICROPHONES_CHANGES_SUBSCRIBE });
    yield put(devicesActions.subscribeOnRemoteSpeakerChanges());
    yield put({ type: callActionTypes.COMPOSITOR_VIEW_CHANGES_SUBSCRIBE });
    yield put({ type: callActionTypes.CAMERA_PRESETS_CHANGES_SUBSCRIBE });
    yield put({
      type: callActionTypes.CAMERA_CONTROLS_PANEL_STATE_CHANGES_SUBSCRIBE,
    });
    yield put(callActions.subscribeOnCompositorUpdates());
    yield put({
      type: chatActionTypes.CHAT_ADD_MESSAGE_CLASS,
      payload: "MSGCLASS_HUNTER",
    });

    const selectedCompositorView = localStorage.getItem(
      "VidyoCore::SelectedCompositorView"
    );
    if (selectedCompositorView) {
      switch (selectedCompositorView) {
        case "GRID":
          yield put(googleAnalyticsActions.loadViewType("GRID"));
          break;
        case "GALLERY":
          yield put(googleAnalyticsActions.loadViewType("STAGE"));
          break;
        default:
          break;
      }
    } else {
      yield put(googleAnalyticsActions.loadViewType("DEFAULT"));
    }
  } else {
    if (error) {
      yield put({ type: callActionTypes.START_CALL_FAILED, reason });
      if (reason !== "VIDYO_CONNECTORFAILREASON_InvalidToken") {
        yield put(devicesActions.cameraTurnOff());
        yield put(devicesActions.microphoneTurnOff());
        yield put(callActions.unsubscribeFromLocalWindowShareChanges());
        yield put(callActions.unsubscribeFromRemoteWindowShareChanges());
        yield put(callActions.unsubscribeFromResourceManagerChanges());
      }
    } else {
      const customDisconnectReason = yield select(
        (state) => state.call.customDisconnectReason
      );
      if (
        customDisconnectReason &&
        reason === "VIDYO_CONNECTORDISCONNECTREASON_Disconnected"
      ) {
        reason = customDisconnectReason;
      }
      yield put({ type: callActionTypes.END_CALL_SUCCEEDED, reason });
      let label = "unknown";
      switch (reason) {
        case "VIDYO_CONNECTORDISCONNECTREASON_Disconnected":
          label = "userLeft";
          if (callProvider.exitAfterAloneInCall) {
            label = "exitAfterAloneInCall";
          }
          break;
        case "VIDYO_CONNECTORDISCONNECTREASON_ConnectionLost":
        case "VIDYO_CONNECTORDISCONNECTREASON_ConnectionTimeout":
        case "VIDYO_CONNECTORDISCONNECTREASON_NoResponse":
        case "VIDYO_CONNECTORDISCONNECTREASON_Terminated":
        case "VIDYO_CONNECTORDISCONNECTREASON_MiscLocalError":
        case "VIDYO_CONNECTORDISCONNECTREASON_MiscRemoteError":
        case "VIDYO_CONNECTORDISCONNECTREASON_MiscError":
        case "VIDYO_CONNECTORDISCONNECTREASON_Booted":
          yield put(devicesActions.cameraTurnOff());
          yield put(devicesActions.microphoneTurnOff());
          yield put(callActions.unsubscribeFromLocalWindowShareChanges());
          yield put(callActions.unsubscribeFromRemoteWindowShareChanges());
          yield put(callActions.unsubscribeFromResourceManagerChanges());
          label = "userDropped";
          break;
        default:
          break;
      }
      callProvider.exitAfterAloneInCall = false;
      yield put(googleAnalyticsActions.callEndAnalytics(label));
      yield put(callActions.unsubscribeFromCompositorUpdates());
      yield put(callActions.unsubscribeFromModerationEvents());
      yield put(callActions.unsubscribeFromModerationTopic());
      yield put(callActions.unsubscribeFromRecorderStatusChanges());
      yield put(callActions.unsubscribeFromCompositorViewChanges());
      yield put(callActions.unsubscribeFromCameraPresetsChanges());
      yield put(callActions.unsubscribeFromCameraControlPanelChanges());
      yield put(devicesActions.resetCameraModerationState());
      yield put(devicesActions.resetMicrophoneModerationState());
      yield put(devicesActions.unsubscribeFromRemoteMicrophonesChanges());
      yield put(devicesActions.unsubscribeFromRemoteCamerasChanges());
      yield put(devicesActions.unsubscribeFromRemoteSpeakerChanges());
    }
  }
}

function* endCall(action) {
  try {
    yield callProvider.endCall();
  } catch (e) {
    yield put({
      type: callActionTypes.END_CALL_FAILED,
      message: e?.message,
    });
  } finally {
    yield put(devicesActions.cameraTurnOff());
    yield put(devicesActions.microphoneTurnOff());
    yield put(callActions.unsubscribeFromLocalWindowShareChanges());
    yield put(callActions.unsubscribeFromRemoteWindowShareChanges());
    yield put(callActions.unsubscribeFromResourceManagerChanges());

    yield put(callActions.unsubscribeFromModerationEvents());
    yield put(callActions.unsubscribeFromModerationTopic());
    yield put(callActions.unsubscribeFromRecorderStatusChanges());
    yield put(devicesActions.resetCameraModerationState());
    yield put(devicesActions.resetMicrophoneModerationState());
  }
}

function* assignVideoRenderer(action) {
  yield delay(300);
  try {
    const result = yield callProvider.assignVideoRenderer(action.payload);

    yield put({
      type: callActionTypes.ASSIGN_VIDEO_RENDERER_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.ASSIGN_VIDEO_RENDERER_FAILED,
      message: e?.message,
    });
  }
}

function* enablePreview(action) {
  try {
    const result = yield callProvider.enablePreview(action.payload.showPrev);
    yield put({
      type: callActionTypes.SHOW_PREVIEW_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.SHOW_PREVIEW_FAILED,
      message: e?.message,
    });
  }
}

function* showSharePreview(action) {
  try {
    const result = yield callProvider.showWindowSharePreview(
      action.payload.showSharePreview
    );
    yield put({
      type: callActionTypes.SHOW_SHARE_PREVIEW_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.SHOW_SHARE_PREVIEW_FAILED,
      message: e?.message,
    });
  }
}

function* subscribeOnParticipantsChanges() {
  try {
    const participantsChannel = yield createParticipantsChangesChannel();
    yield takeLatest(participantsChannel, handleParticipantsChanges);

    yield put({
      type: callActionTypes.PARTICIPANTS_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.PARTICIPANTS_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createParticipantsChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnParticipantsChanges((participants) => {
      const _participants = { ...participants };
      _participants.list = _participants.list.filter(
        (p) => !(p.AppType === "gateway" && p.name === "ClosedCaption")
      );
      _participants.participantJoined = !(
        _participants.participantJoined?.AppType === "gateway" &&
        _participants.participantJoined?.name === "ClosedCaption"
      )
        ? _participants.participantJoined
        : null;
      _participants.participantLeft = !(
        _participants.participantLeft?.AppType === "gateway" &&
        _participants.participantLeft?.name === "ClosedCaption"
      )
        ? _participants.participantLeft
        : null;

      setTimeout(() => {
        emit(_participants);
      });
    });
    return () => {
      callProvider.unsubscribeFromParticipantsChanges();
    };
  });
}

function* handleParticipantsChanges(participants) {
  yield put(callActions.updateParticipants(participants));
}

function* unsubscribeFromParticipantsChanges() {
  try {
    const result = yield callProvider.unsubscribeFromParticipantsChanges();

    yield put({
      type: callActionTypes.PARTICIPANTS_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.PARTICIPANTS_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      message: e?.message,
    });
  }
}

function* subscribeOnRecorderStatusChanges() {
  try {
    const recorderStatusChannel = yield createRecorderStatusChannel();
    yield takeLatest(recorderStatusChannel, handleRecorderStatusChanges);

    yield put({
      type: callActionTypes.RECORDER_STATUS_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.RECORDER_STATUS_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createRecorderStatusChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnRecorderStatusChanges((recorderStatus) => {
      setTimeout(() => {
        emit(recorderStatus);
      });
    });
    return () => {
      callProvider.unsubscribeFromRecorderStatusChanges();
    };
  });
}

function* handleRecorderStatusChanges(recorderStatus) {
  yield put(callActions.updateRecorderStatus(recorderStatus));
}

function* unsubscribeFromRecorderStatusChanges() {
  try {
    const result = yield callProvider.unsubscribeFromRecorderStatusChanges();

    yield put({
      type: callActionTypes.RECORDER_STATUS_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
    yield put(callActions.updateRecorderStatus(false));
  } catch (e) {
    yield put({
      type: callActionTypes.RECORDER_STATUS_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      message: e?.message,
    });
  }
}

function* subscribeOnResourceManagerChanges() {
  try {
    const resourceManagerEventChannel =
      yield createResourceManagerEventChannel();
    yield takeLatest(resourceManagerEventChannel, handleResourceManagerChanges);

    yield put({
      type: callActionTypes.RESOURCE_MANAGER_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.RESOURCE_MANAGER_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createResourceManagerEventChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnResourceManagerChanges((resourceMenagerData) => {
      setTimeout(() => {
        emit(resourceMenagerData);
      });
    });
    return () => {
      callProvider.unsubscribeResourceManagerChanges();
    };
  });
}

function* handleResourceManagerChanges({ dataType, data }) {
  if (dataType === "availableResources") {
    yield put(callActions.updateAvailableResources(data)); // todo
  } else if (dataType === "maxRemoteSources") {
    // not implemented
  }
}

function* unsubscribeFromResourceManagerChanges() {
  try {
    const result = yield callProvider.unsubscribeResourceManagerChanges();

    yield put({
      type: callActionTypes.RESOURCE_MANAGER_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.RESOURCE_MANAGER_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      message: e?.message,
    });
  }
}

function* subscribeOnRemoteCamerasChanges() {
  try {
    const remoteCamerasChannel = yield createRemoteCameraChangesChannel();
    yield takeLatest(remoteCamerasChannel, handleRemoteCameraChanges);

    yield put({
      type: deviceActionTypes.REMOTE_CAMERAS_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: deviceActionTypes.REMOTE_CAMERAS_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createRemoteCameraChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnRemoteCamerasChanges((cameras) => {
      setTimeout(() => {
        emit(cameras);
      });
    });
    return () => {
      callProvider.unsubscribeFromRemoteCamerasChanges();
    };
  });
}

function* handleRemoteCameraChanges(remoteCameras) {
  yield put(devicesActions.updateRemoteCameras(remoteCameras));
}

function* unsubscribeFromRemoteCamerasChanges() {
  try {
    const result = yield callProvider.unsubscribeFromRemoteCamerasChanges();

    yield put({
      type: deviceActionTypes.REMOTE_CAMERAS_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: deviceActionTypes.REMOTE_CAMERAS_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      message: e?.message,
    });
  }
}

function* subscribeOnRemoteMicrophonesChanges() {
  try {
    const remoteMicrophonesChannel =
      yield createRemoteMicrophoneChangesChannel();
    yield takeLatest(remoteMicrophonesChannel, handleRemoteMicrophoneChanges);

    yield put({
      type: deviceActionTypes.REMOTE_MICROPHONES_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: deviceActionTypes.REMOTE_MICROPHONES_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createRemoteMicrophoneChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnRemoteMicrophonesChanges((remoteMicrophones) => {
      setTimeout(() => {
        emit(remoteMicrophones);
      });
    });
    return () => {
      callProvider.unsubscribeFromRemoteMicrophonesChanges();
    };
  });
}

function* handleRemoteMicrophoneChanges(remoteMicrophones) {
  yield put(devicesActions.updateRemoteMicrophones(remoteMicrophones));
}

function* unsubscribeFromRemoteMicrophonesChanges() {
  try {
    const result = yield callProvider.unsubscribeFromRemoteMicrophonesChanges();

    yield put({
      type: deviceActionTypes.REMOTE_MICROPHONES_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: deviceActionTypes.REMOTE_MICROPHONES_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      message: e?.message,
    });
  }
}

function* subscribeOnRemoteSpeakerChanges() {
  try {
    const remoteSpeakerChannel = yield createRemoteSpeakerChangesChannel();
    yield takeLatest(remoteSpeakerChannel, handleRemoteSpeakerChanges);

    yield put({
      type: deviceActionTypes.REMOTE_SPEAKER_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: deviceActionTypes.REMOTE_SPEAKER_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createRemoteSpeakerChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnRemoteSpeakerChanges((remoteSpeaker) => {
      setTimeout(() => {
        emit({ remoteSpeaker });
      });
    });
    return () => {
      callProvider.unsubscribeFromRemoteSpeakerChanges();
    };
  }, buffers.expanding());
}

function* handleRemoteSpeakerChanges({ remoteSpeaker }) {
  yield put(devicesActions.updateRemoteSpeaker(remoteSpeaker));
}

function* unsubscribeFromRemoteSpeakerChanges() {
  try {
    const result = yield callProvider.unsubscribeFromRemoteSpeakerChanges();

    yield put({
      type: deviceActionTypes.REMOTE_SPEAKER_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: deviceActionTypes.REMOTE_SPEAKER_CHANGES_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* subscribeOnLocalWindowShareChanges(action) {
  try {
    const localWindowShareChannel = createLocalWindowShareChannel();
    yield takeLatest(localWindowShareChannel, handleLocalWindowShareChanges);

    yield put({
      type: callActionTypes.LOCAL_WINDOW_SHARE_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.LOCAL_WINDOW_SHARE_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createLocalWindowShareChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnLocalWindowShareChanges((shares) => {
      setTimeout(() => {
        emit(shares);
      });
    });
    return () => {
      callProvider.unsubscribeFromLocalWindowShareChanges();
    };
  }, buffers.expanding());
}

function* handleLocalWindowShareChanges(shares) {
  yield put(callActions.updateLocalWindowShares(shares));
}

function* unsubscribeFromLocalWindowShareChanges() {
  try {
    const result = yield callProvider.unsubscribeFromLocalWindowShareChanges();

    yield put({
      type: callActionTypes.LOCAL_WINDOW_SHARE_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.LOCAL_WINDOW_SHARE_CHANGES_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* subscribeOnRemoteWindowShareChanges(action) {
  try {
    const remoteWindowShareChannel = createRemoteWindowShareChannel();
    yield takeLatest(remoteWindowShareChannel, handleRemoteWindowShareChanges);

    yield put({
      type: callActionTypes.REMOTE_WINDOW_SHARE_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.REMOTE_WINDOW_SHARE_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createRemoteWindowShareChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnRemoteWindowShareChanges((shares) => {
      setTimeout(() => {
        emit(shares);
      });
    });
    return () => {
      callProvider.unsubscribeFromRemoteWindowShareChanges();
    };
  }, buffers.expanding());
}

function* handleRemoteWindowShareChanges(shares) {
  if (shares.length) {
    const selectedShare = yield select((state) => state.call.selectedShare);
    if (selectedShare) {
      yield put(callActions.stopWindowShare());
    }
  }
  yield put(callActions.updateRemoteWindowShares(shares));
}

function* unsubscribeFromRemoteWindowShareChanges() {
  try {
    const result = yield callProvider.unsubscribeFromRemoteWindowShareChanges();

    yield put({
      type: callActionTypes.REMOTE_WINDOW_SHARE_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.REMOTE_WINDOW_SHARE_CHANGES_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* startWindowShare(action) {
  try {
    const result = yield callProvider.startShare({
      localWindowShare: action.localWindowShare,
    });

    yield put({
      type: callActionTypes.WINDOW_SHARE_START_SUCCEEDED,
      result,
    });
    yield put(googleAnalyticsActions.shareAnalytics());
  } catch (e) {
    yield put({
      type: callActionTypes.WINDOW_SHARE_START_FAILED,
      message: e?.message,
    });
  }
}

function* stopWindowShare(action) {
  try {
    const result = yield callProvider.stopShare();

    yield put({
      type: callActionTypes.WINDOW_SHARE_STOP_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.WINDOW_SHARE_STOP_FAILED,
      message: e?.message,
    });
  }
}

function* pinParticipant(action) {
  try {
    const result = yield callProvider.pinParticipant(action.payload);
    if (result) {
      yield put({
        type: callActionTypes.PIN_PARTICIPANT_SUCCEEDED,
        payload: action.payload,
      });
    } else {
      yield put({
        type: callActionTypes.PIN_PARTICIPANT_FAILED,
      });
    }
  } catch (e) {
    yield put({
      type: callActionTypes.PIN_PARTICIPANT_FAILED,
      message: e?.message,
    });
  }
}

function* unpinParticipant(action) {
  try {
    const result = yield callProvider.pinParticipant(action.payload);
    if (result) {
      yield put({
        type: callActionTypes.UNPIN_PARTICIPANT_SUCCEEDED,
        payload: action.payload,
      });
    } else {
      yield put({
        type: callActionTypes.UNPIN_PARTICIPANT_FAILED,
      });
    }
  } catch (e) {
    yield put({
      type: callActionTypes.UNPIN_PARTICIPANT_FAILED,
      message: e?.message,
    });
  }
}

function* subscribeOnModerationEvents(action) {
  try {
    const moderationEventsChannel = createModerationEventsChannel();
    yield takeLatest(moderationEventsChannel, handleModerationEvents);

    yield put({
      type: callActionTypes.MODERATION_EVENTS_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.MODERATION_EVENTS_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createModerationEventsChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnModerationEvents(
      (deviceType, moderationType, state) => {
        setTimeout(() => {
          emit({ deviceType, moderationType, state });
        });
      }
    );
    return () => {
      callProvider.unsubscribeFromModerationEvents();
    };
  });
}

function* handleModerationEvents(response) {
  try {
    const { deviceType, moderationType, state } = response || {};
    const { devices } = yield select();
    const { microphoneModerationState, cameraModerationState } = devices;

    switch (deviceType) {
      case "VIDYO_DEVICETYPE_LocalMicrophone":
        if (
          microphoneModerationState?.moderationType ===
            deviceDisableReason.HARD_MUTED &&
          microphoneModerationState?.state &&
          moderationType === deviceDisableReason.SOFT_MUTED
        ) {
          return;
        }
        yield put(
          devicesActions.setMicrophoneModerationState({
            moderationType,
            state,
          })
        );
        if (state === true) {
          yield put(devicesActions.microphoneTurnOff());
        } else {
          if (moderationType === deviceDisableReason.SOFT_MUTED) {
            yield put(devicesActions.microphoneTurnOn());
          }
        }
        break;
      case "VIDYO_DEVICETYPE_LocalCamera":
        if (
          cameraModerationState?.moderationType ===
            deviceDisableReason.HARD_MUTED &&
          cameraModerationState?.state &&
          moderationType === deviceDisableReason.SOFT_MUTED
        ) {
          return;
        }
        yield put(
          devicesActions.setCameraModerationState({
            moderationType,
            state,
          })
        );
        if (state === true) {
          yield put(devicesActions.cameraTurnOff());
        } else {
          if (moderationType === deviceDisableReason.SOFT_MUTED) {
            yield put(devicesActions.cameraTurnOn());
          }
        }
        break;
      case "VIDYO_DEVICETYPE_LocalMonitor":
      case "VIDYO_DEVICETYPE_LocalWindowShare":
      case "VIDYO_DEVICETYPE_LocalSpeaker":
      case "VIDYO_DEVICETYPE_LocalRenderer":
      case "VIDYO_DEVICETYPE_RemoteCamera":
      case "VIDYO_DEVICETYPE_RemoteMicrophone":
      case "VIDYO_DEVICETYPE_RemoteWindowShare":
      case "VIDYO_DEVICETYPE_RemoteSpeaker":
      case "VIDYO_DEVICETYPE_RemoteRenderer":
      case "VIDYO_DEVICETYPE_VirtualVideoSource":
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("HandleModerationEvents error: ", error?.message);
  }
  yield true;
}

function* unsubscribeFromModerationEvents() {
  try {
    const result = yield callProvider.unsubscribeFromModerationEvents();
    yield put({
      type: callActionTypes.MODERATION_EVENTS_UNSUBSCRIBE_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.MODERATION_EVENTS_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* subscribeOnCompositorUpdates() {
  try {
    const compositorUpdatesChannel = createCompositorUpdatesChannel();
    yield takeLatest(compositorUpdatesChannel, handleCompositorUpdates);

    yield put({
      type: callActionTypes.COMPOSITOR_UPDATES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.COMPOSITOR_UPDATES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createCompositorUpdatesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnCompositorUpdates((payload) => {
      setTimeout(() => emit(payload));
    });
    return () => {
      callProvider.unsubscribeFromCompositorUpdates();
    };
  });
}

function* handleCompositorUpdates(payload) {
  yield put(callActions.compositorUpdated(payload));
}

function* unsubscribeFromCompositorUpdates() {
  try {
    const result = yield callProvider.unsubscribeFromCompositorUpdates();

    yield put({
      type: callActionTypes.COMPOSITOR_UPDATES_UNSUBSCRIBE_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.COMPOSITOR_UPDATES_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* compositorSetGalleryView() {
  try {
    const result = yield callProvider.setCompositorGalleryView();

    yield put({
      type: callActionTypes.COMPOSITOR_SET_GALLERY_VIEW_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.COMPOSITOR_SET_GALLERY_VIEW_FAILED,
      message: e?.message,
    });
  }
}

function* compositorSetGridView() {
  try {
    const result = yield callProvider.setCompositorGridView();

    yield put({
      type: callActionTypes.COMPOSITOR_SET_GRID_VIEW_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.COMPOSITOR_SET_GRID_VIEW_FAILED,
      message: e?.message,
    });
  }
}

function* setFeccPresetsLabel(action) {
  try {
    const result = yield callProvider.setFeccPresetsLabel(action.payload);

    yield put({
      type: callActionTypes.FECC_PRESETS_SET_TITLE_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.FECC_PRESETS_SET_TITLE_FAILED,
      message: e?.message,
    });
  }
}

function* setFeccPresetsSelectLabel(action) {
  try {
    const result = yield callProvider.setFeccPresetsSelectLabel(action.payload);

    yield put({
      type: callActionTypes.FECC_PRESETS_SELECT_SET_TITLE_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.FECC_PRESETS_SELECT_SET_TITLE_FAILED,
      message: e?.message,
    });
  }
}

function* subscribeOnCompositorViewChange() {
  try {
    const compositorUpdatesChannel = createCompositorViewChangeChannel();
    yield takeLatest(
      compositorUpdatesChannel,
      handleCompositorViewChangeUpdates
    );

    yield put({
      type: callActionTypes.COMPOSITOR_VIEW_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.COMPOSITOR_VIEW_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* unsubscribeFromCompositorViewChanges() {
  try {
    const result = yield callProvider.unsubscribeFromCompositorViewChanges();

    yield put({
      type: callActionTypes.COMPOSITOR_VIEW_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.COMPOSITOR_VIEW_CHANGES_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* unsubscribeFromCameraPresetsChanges() {
  try {
    const result = yield callProvider.unsubscribeFromCameraPresetsChanges();

    yield put({
      type: callActionTypes.CAMERA_PRESETS_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.CAMERA_PRESETS_CHANGES_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* unsubscribeFromCameraControlPanelChanges() {
  try {
    const result =
      yield callProvider.unsubscribeFromCameraControlPanelChanges();

    yield put({
      type: callActionTypes.CAMERA_CONTROLS_PANEL_STATE_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.CAMERA_CONTROLS_PANEL_STATE_CHANGES_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createCompositorViewChangeChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnCompositorViewChange((payload) => {
      setTimeout(() => {
        emit(payload);
      });
    });

    return () => {
      callProvider.unsubscribeFromCompositorViewChanges();
    };
  });
}

function* handleCompositorViewChangeUpdates(payload) {
  if (OperatingSystemInfoProvider.IsTabletDevice()) {
    if (payload?.view === "GRID") {
      yield put(configActions.setParticipantLimit(tabletsGridParticipantLimit));
    } else {
      yield put(configActions.setParticipantLimit(participantLimit));
    }
  }

  if (payload?.isUserInteraction) {
    switch (payload?.view) {
      case "GRID":
        yield put(googleAnalyticsActions.selectViewType("GRID"));
        break;
      case "GALLERY":
        yield put(googleAnalyticsActions.selectViewType("STAGE"));
        break;
      default:
        break;
    }
  }

  yield put(callActions.compositorViewChanged(payload?.view));
}

function* subscribeOnCameraPresetChange() {
  try {
    const presetsUpdatesChannel = createCameraPresetChangeChannel();
    yield takeLatest(presetsUpdatesChannel, handleCameraPresetChangeUpdates);

    yield put({
      type: callActionTypes.CAMERA_PRESETS_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.CAMERA_PRESETS_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createCameraPresetChangeChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnCameraPresetChange((payload) => {
      setTimeout(() => {
        emit(payload);
      });
    });

    return () => {
      callProvider.unsubscribeFromCameraPresetsChanges();
    };
  });
}

function* handleCameraPresetChangeUpdates(payload) {
  yield put(googleAnalyticsActions.cameraPresetChange());
}

function* subscribeOnCameraControlsPanelStateChange() {
  try {
    const presetsUpdatesChannel = createCameraControlsPanelStateChangeChannel();
    yield takeLatest(
      presetsUpdatesChannel,
      handleCameraControlsPanelStateChangeUpdates
    );

    yield put({
      type: callActionTypes.CAMERA_CONTROLS_PANEL_STATE_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.CAMERA_CONTROLS_PANEL_STATE_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createCameraControlsPanelStateChangeChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnCameraControlsPanelStateChange((payload) => {
      setTimeout(() => {
        emit(payload);
      });
    });

    return () => {
      callProvider.unsubscribeFromCameraControlPanelChanges();
    };
  });
}

function* handleCameraControlsPanelStateChangeUpdates(payload) {
  if (payload.state === "OPEN") {
    yield put(googleAnalyticsActions.openFeccControls());
    yield put({
      type: callActionTypes.FECC_STATE_TOGGLE,
      payload: true,
    });
  } else {
    yield put({
      type: callActionTypes.FECC_STATE_TOGGLE,
      payload: false,
    });
  }
}

function* subscribeToTopic(action) {
  try {
    const result = yield callProvider.subscribeToTopic(action.payload);

    yield put({
      type: callActionTypes.SUBSCRIBE_TO_TOPIC_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.SUBSCRIBE_TO_TOPIC_FAILED,
      message: e?.message,
    });
  }
}

function* unsubscribeFromTopic(action) {
  try {
    const result = yield callProvider.unsubscribeFromTopic(action.payload);

    yield put({
      type: callActionTypes.UNSUBSCRIBE_FROM_TOPIC_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.UNSUBSCRIBE_FROM_TOPIC_FAILED,
      message: e?.message,
    });
  }
}

function* subscribeOnModerationTopic(action) {
  try {
    const moderationTopicChannel = createModerationTopicChannel();
    yield takeLatest(moderationTopicChannel, handleModerationTopicMessages);

    yield put({
      type: callActionTypes.MODERATION_TOPIC_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.MODERATION_TOPIC_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createModerationTopicChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnModerationTopic((payload) => {
      setTimeout(() => {
        emit(payload);
      });
    });
    return () => {
      callProvider.unsubscribeFromModerationTopic();
    };
  });
}

function* handleModerationTopicMessages(message) {
  try {
    yield VCAPMessageProcessor.process(message);
  } catch (error) {
    yield console.error("Error while handleModerationTopicMessages", error);
  }
}

function* unsubscribeFromModerationTopic(action) {
  try {
    const result = yield callProvider.unsubscribeFromModerationTopic();

    yield put({
      type: callActionTypes.MODERATION_TOPIC_UNSUBSCRIBE_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.MODERATION_TOPIC_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* actionWatcher() {
  yield takeLatest(callActionTypes.START_CALL, startCall);
  yield takeLatest(callActionTypes.END_CALL, endCall);
  yield takeLatest(callActionTypes.ASSIGN_VIDEO_RENDERER, assignVideoRenderer);
  yield takeLatest(callActionTypes.WINDOW_SHARE_START, startWindowShare);
  yield takeLatest(callActionTypes.WINDOW_SHARE_STOP, stopWindowShare);
  yield takeLatest(callActionTypes.GET_CALL_PROPERTIES, getCallProperties);
  yield takeLatest(callActionTypes.PIN_PARTICIPANT, pinParticipant);
  yield takeLatest(callActionTypes.UNPIN_PARTICIPANT, unpinParticipant);
  yield takeLatest(callActionTypes.SHOW_PREVIEW, enablePreview);
  yield takeLatest(callActionTypes.SHOW_SHARE_PREVIEW, showSharePreview);
  yield takeLatest(
    callActionTypes.PARTICIPANTS_CHANGES_SUBSCRIBE,
    subscribeOnParticipantsChanges
  );
  yield takeLatest(
    callActionTypes.PARTICIPANTS_CHANGES_UNSUBSCRIBE,
    unsubscribeFromParticipantsChanges
  );
  yield takeLatest(
    callActionTypes.RECORDER_STATUS_CHANGES_SUBSCRIBE,
    subscribeOnRecorderStatusChanges
  );
  yield takeLatest(
    callActionTypes.RECORDER_STATUS_CHANGES_UNSUBSCRIBE,
    unsubscribeFromRecorderStatusChanges
  );
  yield takeLatest(
    callActionTypes.RESOURCE_MANAGER_CHANGES_SUBSCRIBE,
    subscribeOnResourceManagerChanges
  );
  yield takeLatest(
    callActionTypes.RESOURCE_MANAGER_CHANGES_UNSUBSCRIBE,
    unsubscribeFromResourceManagerChanges
  );
  yield takeLatest(
    callActionTypes.LOCAL_WINDOW_SHARE_CHANGES_SUBSCRIBE,
    subscribeOnLocalWindowShareChanges
  );
  yield takeLatest(
    callActionTypes.LOCAL_WINDOW_SHARE_CHANGES_UNSUBSCRIBE,
    unsubscribeFromLocalWindowShareChanges
  );
  yield takeLatest(
    callActionTypes.REMOTE_WINDOW_SHARE_CHANGES_SUBSCRIBE,
    subscribeOnRemoteWindowShareChanges
  );
  yield takeLatest(
    callActionTypes.REMOTE_WINDOW_SHARE_CHANGES_UNSUBSCRIBE,
    unsubscribeFromRemoteWindowShareChanges
  );
  yield takeLatest(
    deviceActionTypes.REMOTE_CAMERAS_CHANGES_SUBSCRIBE,
    subscribeOnRemoteCamerasChanges
  );
  yield takeLatest(
    deviceActionTypes.REMOTE_MICROPHONES_CHANGES_SUBSCRIBE,
    subscribeOnRemoteMicrophonesChanges
  );
  yield takeLatest(
    deviceActionTypes.REMOTE_MICROPHONES_CHANGES_UNSUBSCRIBE,
    unsubscribeFromRemoteMicrophonesChanges
  );
  yield takeLatest(
    deviceActionTypes.REMOTE_SPEAKER_CHANGES_SUBSCRIBE,
    subscribeOnRemoteSpeakerChanges
  );
  yield takeLatest(
    deviceActionTypes.REMOTE_SPEAKER_CHANGES_UNSUBSCRIBE,
    unsubscribeFromRemoteSpeakerChanges
  );
  yield takeLatest(
    deviceActionTypes.REMOTE_CAMERAS_CHANGES_UNSUBSCRIBE,
    unsubscribeFromRemoteCamerasChanges
  );
  yield takeLatest(
    callActionTypes.MODERATION_EVENTS_SUBSCRIBE,
    subscribeOnModerationEvents
  );
  yield takeLatest(
    callActionTypes.MODERATION_EVENTS_UNSUBSCRIBE,
    unsubscribeFromModerationEvents
  );
  yield takeLatest(
    callActionTypes.COMPOSITOR_UPDATES_SUBSCRIBE,
    subscribeOnCompositorUpdates
  );
  yield takeLatest(
    callActionTypes.COMPOSITOR_UPDATES_UNSUBSCRIBE,
    unsubscribeFromCompositorUpdates
  );
  yield takeLatest(
    callActionTypes.COMPOSITOR_VIEW_CHANGES_SUBSCRIBE,
    subscribeOnCompositorViewChange
  );
  yield takeLatest(
    callActionTypes.CAMERA_PRESETS_CHANGES_SUBSCRIBE,
    subscribeOnCameraPresetChange
  );
  yield takeLatest(
    callActionTypes.CAMERA_CONTROLS_PANEL_STATE_CHANGES_SUBSCRIBE,
    subscribeOnCameraControlsPanelStateChange
  );
  yield takeLatest(
    callActionTypes.COMPOSITOR_SET_GALLERY_VIEW,
    compositorSetGalleryView
  );
  yield takeLatest(
    callActionTypes.COMPOSITOR_SET_GRID_VIEW,
    compositorSetGridView
  );
  yield takeLatest(callActionTypes.FECC_PRESETS_SET_TITLE, setFeccPresetsLabel);
  yield takeLatest(
    callActionTypes.FECC_PRESETS_SELECT_SET_TITLE,
    setFeccPresetsSelectLabel
  );
  yield takeLatest(callActionTypes.SUBSCRIBE_TO_TOPIC, subscribeToTopic);
  yield takeLatest(
    callActionTypes.UNSUBSCRIBE_FROM_TOPIC,
    unsubscribeFromTopic
  );
  yield takeLatest(
    callActionTypes.MODERATION_TOPIC_SUBSCRIBE,
    subscribeOnModerationTopic
  );
  yield takeLatest(
    callActionTypes.MODERATION_TOPIC_UNSUBSCRIBE,
    unsubscribeFromModerationTopic
  );
  yield takeLatest(
    callActionTypes.COMPOSITOR_VIEW_CHANGES_UNSUBSCRIBE,
    unsubscribeFromCompositorViewChanges
  );
  yield takeLatest(
    callActionTypes.CAMERA_PRESETS_CHANGES_UNSUBSCRIBE,
    unsubscribeFromCameraPresetsChanges
  );
  yield takeLatest(
    callActionTypes.CAMERA_CONTROLS_PANEL_STATE_CHANGES_UNSUBSCRIBE,
    unsubscribeFromCameraControlPanelChanges
  );
}

export default actionWatcher;
