import { buffers } from "redux-saga";
import { eventChannel, END } from "redux-saga";
import { put, call, select, takeLatest, delay } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import * as devicesActions from "../actions/devices";
import * as callActionTypes from "../actions/types/call";
import * as googleAnalyticsActions from "../actions/googleAnalytics";
import * as deviceActionTypes from "../actions/types/devices";
import * as callActions from "../actions/call";
import { deviceDisableReason } from "utils/constants";

const callProvider = getCallAPIProvider();

function* startCall(action) {
  try {
    yield put({ type: callActionTypes.MODERATION_EVENTS_SUBSCRIBE });
    const callChannel = yield call(createCallChannel, action);
    yield takeLatest(callChannel, handleCallStatus);
  } catch (e) {
    yield put({
      type: callActionTypes.START_CALL_FAILED,
      message: e.message,
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
      message: e.message,
    });
  }
}

function createCallChannel(action) {
  return eventChannel((emit) => {
    const onDisconnected = (reason, error) => {
      emit({ isCallStarted: false, reason, error });
      emit(END);
    };

    callProvider.startCall({ ...action.payload, onDisconnected }).then(() => {
      emit({ isCallStarted: true });
    });

    return () => {};
  });
}

function* handleCallStatus({ isCallStarted, reason, error }) {
  if (isCallStarted) {
    yield put({
      type: callActionTypes.START_CALL_SUCCEEDED,
      callStartedTime: new Date().getTime(),
    });
    yield put({ type: callActionTypes.GET_CALL_PROPERTIES });
    yield put({ type: callActionTypes.PARTICIPANTS_CHANGES_SUBSCRIBE });
    yield put({ type: callActionTypes.RECORDER_STATUS_CHANGES_SUBSCRIBE });
    yield put({ type: callActionTypes.RESOURCE_MANAGER_CHANGES_SUBSCRIBE });
    yield put({ type: callActionTypes.LOCAL_WINDOW_SHARE_CHANGES_SUBSCRIBE });
    yield put({ type: callActionTypes.REMOTE_WINDOW_SHARE_CHANGES_SUBSCRIBE });
    yield put({ type: deviceActionTypes.REMOTE_CAMERAS_CHANGES_SUBSCRIBE });
    yield put({ type: deviceActionTypes.REMOTE_MICROPHONES_CHANGES_SUBSCRIBE });
    yield put(devicesActions.subscribeOnRemoteSpeakerChanges());
    yield put(callActions.subscribeOnCompositorUpdates());
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
      yield put({ type: callActionTypes.END_CALL_SUCCEEDED, reason });
      let label = "unknown";
      switch (reason) {
        case "VIDYO_CONNECTORDISCONNECTREASON_Disconnected":
          label = "userLeft";
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
      yield put(googleAnalyticsActions.callEndAnalytics(label));
      yield put(devicesActions.unsubscribeFromRemoteSpeakerChanges());
      yield put(callActions.unsubscribeFromCompositorUpdates());
    }
  }
}

function* endCall() {
  try {
    yield callProvider.endCall();
  } catch (e) {
    yield put({
      type: callActionTypes.END_CALL_FAILED,
      message: e.message,
    });
  } finally {
    yield put(devicesActions.cameraTurnOff());
    yield put(devicesActions.microphoneTurnOff());
    yield put(callActions.unsubscribeFromLocalWindowShareChanges());
    yield put(callActions.unsubscribeFromRemoteWindowShareChanges());
    yield put(callActions.unsubscribeFromResourceManagerChanges());

    yield put(callActions.unsubscribeFromModerationEvents());
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
      message: e.message,
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
      message: e.message,
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
      message: e.message,
    });
  }
}

function createParticipantsChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnParticipantsChanges((participants) => {
      emit(participants);
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
      message: e.message,
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
      message: e.message,
    });
  }
}

function createRecorderStatusChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnRecorderStatusChanges((recorderStatus) => {
      emit(recorderStatus);
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
  } catch (e) {
    yield put({
      type: callActionTypes.RECORDER_STATUS_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      message: e.message,
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
      message: e.message,
    });
  }
}

function createResourceManagerEventChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnResourceManagerChanges((resourceMenagerData) => {
      emit(resourceMenagerData);
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
      message: e.message,
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
      message: e.message,
    });
  }
}

function createRemoteCameraChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnRemoteCamerasChanges((cameras) => {
      emit(cameras);
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
      message: e.message,
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
      message: e.message,
    });
  }
}

function createRemoteMicrophoneChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnRemoteMicrophonesChanges((remoteMicrophones) => {
      emit(remoteMicrophones);
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
      message: e.message,
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
      message: e.message,
    });
  }
}

function createRemoteSpeakerChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnRemoteSpeakerChanges((remoteSpeaker) => {
      emit({ remoteSpeaker });
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
      message: e.message,
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
      message: e.message,
    });
  }
}

function createLocalWindowShareChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnLocalWindowShareChanges((shares) => {
      emit(shares);
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
      message: e.message,
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
      message: e.message,
    });
  }
}

function createRemoteWindowShareChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnRemoteWindowShareChanges((shares) => {
      emit(shares);
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
      message: e.message,
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
      message: e.message,
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
      message: e.message,
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
      message: e.message,
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
      message: e.message,
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
      message: e.message,
    });
  }
}

function createModerationEventsChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnModerationEvents(
      (deviceType, moderationType, state) => {
        emit({ deviceType, moderationType, state });
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

function* unsubscribeOnModerationEvents() {
  try {
    const result = yield callProvider.unsubscribeFromModerationEvents();
    yield put({
      type: callActionTypes.MODERATION_EVENTS_UNSUBSCRIBE_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: callActionTypes.MODERATION_EVENTS_UNSUBSCRIBE_FAILED,
      message: e.message,
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
      message: e.message,
    });
  }
}

function createCompositorUpdatesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnCompositorUpdates((payload) => void emit(payload));
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
      message: e.message,
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
    unsubscribeOnModerationEvents
  );
  yield takeLatest(
    callActionTypes.COMPOSITOR_UPDATES_SUBSCRIBE,
    subscribeOnCompositorUpdates
  );
  yield takeLatest(
    callActionTypes.COMPOSITOR_UPDATES_UNSUBSCRIBE,
    unsubscribeFromCompositorUpdates
  );
}

export default actionWatcher;
