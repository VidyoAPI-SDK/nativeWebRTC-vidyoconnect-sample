import { eventChannel } from "redux-saga";
import { put, select, takeLatest } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import * as devicesActionType from "store/actions/types/devices";
import * as devicesActions from "store/actions/devices";
import * as callActionTypes from "store/actions/types/call";
import * as actionTypes from "./actions/types";
import * as actions from "./actions/creators";
import { isStethoscope } from "utils/helpers";

const callProvider = getCallAPIProvider();

function* handleCallStarted() {
  yield put(actions.subscribeOnUnprocessedAudioUpdates());
}

function* handleCallFailed() {
  yield put(actions.unsubscribeFromUnprocessedAudioUpdates());
}

function* handleCallEnded() {
  yield put(actions.unsubscribeFromUnprocessedAudioUpdates());
}

function* handleRemoteSpeaker(action) {
  if (action.speaker) {
    yield put({ type: actionTypes.SELECT_LOCAL_STETHOSCOPE });
  }
}

function* handleLocalMicrophones(action) {
  const mics = [];
  const specialMics = [];
  const selectedLocalStethoscope = yield select(
    (state) => state.feature_stethoscope.selectedLocalStethoscope
  );
  let needToSwitchToRegularMicrophone = false;

  for (const localMicrophone of action.microphones) {
    if (isStethoscope(localMicrophone)) {
      if (localMicrophone.selected) {
        needToSwitchToRegularMicrophone = true;
        console.log(
          `Selected device ${localMicrophone.name} is a Stethoscope. Need to switch to regular device.`
        );
      }
      try {
        yield localMicrophone.SetSignalType({
          signalType: "VIDYO_DEVICEAUDIOSIGNALTYPE_Unprocessed",
        });
        console.log(
          `The Audio device ${localMicrophone.name} is a Stethoscope.`
        );
      } catch (e) {
        console.error("Error on device.SetSignalType for StethoscopeDevice", e);
      }
      specialMics.push(localMicrophone);
    } else {
      mics.push(localMicrophone);
    }
  }

  yield put(devicesActions.setMicrophones(mics));
  yield put(actions.updateLocalStethoscopes(specialMics));

  if (needToSwitchToRegularMicrophone) {
    yield put(devicesActions.selectMicrophone(mics[mics.length - 1]));
  }

  if (specialMics.length && !selectedLocalStethoscope) {
    yield put(actions.selectLocalStethoscope(specialMics[0]));
  } else if (specialMics.length) {
    // if selected special mic removed then select first in list
    if (!specialMics.find((mic) => mic.id === selectedLocalStethoscope.id)) {
      yield put(actions.selectLocalStethoscope(specialMics[0]));
    }
  } else if (!specialMics.length && selectedLocalStethoscope) {
    yield put(actions.unselectLocalStethoscope());
  }
}

function* handleRemoteMicrophones(action) {
  const remoteStethoscopes = [];
  for (let remoteMicrophone of action.remoteMicrophones) {
    try {
      const signalType = yield remoteMicrophone.GetSignalType();
      if (signalType === "VIDYO_DEVICEAUDIOSIGNALTYPE_Unprocessed") {
        remoteStethoscopes.push(remoteMicrophone);
      }
    } catch (err) {}
  }
  const { selectedRemoteStethoscope, isRemoteStethoscopeStarted } =
    yield select((state) => state.feature_stethoscope);
  if (
    selectedRemoteStethoscope &&
    remoteStethoscopes.every((d) => d.id !== selectedRemoteStethoscope.id)
  ) {
    yield put({
      type: actionTypes.SELECTED_REMOTE_STETHOSCOPE_REMOVED,
    });
    if (isRemoteStethoscopeStarted) {
      yield callProvider.enableDynamicAudioSources();
    }
  }
  yield put(actions.updateRemoteStethoscopes(remoteStethoscopes));
}

function* selectLocalStethoscope(action) {
  try {
    const remoteSpeaker = yield select((state) => state.devices.remoteSpeaker);
    const selectedLocalStethoscope = yield select(
      (state) => state.feature_stethoscope.selectedLocalStethoscope
    );
    let localStethoscope = action.localStethoscope || selectedLocalStethoscope;
    if (!localStethoscope) {
      throw new Error("localStethoscope is null");
    }
    if (remoteSpeaker) {
      try {
        if (
          selectedLocalStethoscope &&
          selectedLocalStethoscope.id !== localStethoscope.id
        ) {
          yield put(actions.unselectLocalStethoscope(selectedLocalStethoscope));
        }
        yield callProvider.selectLocalStethoscope(
          localStethoscope,
          remoteSpeaker
        );
        console.log(
          `selected localStethoscope: ${localStethoscope.name}, and added to remote speaker`
        );
      } catch (e) {
        console.log(
          `selected localStethoscope: ${localStethoscope.name}, but not added to remote speaker due to an error`,
          e
        );
      }
    } else {
      console.log(
        `selected localStethoscope: ${localStethoscope.name}, but not added to remote speaker`
      );
    }
    yield put({
      type: actionTypes.SELECT_LOCAL_STETHOSCOPE_SUCCEEDED,
      selectedLocalStethoscope: localStethoscope,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SELECT_LOCAL_STETHOSCOPE_FAILED,
      message: e.message,
    });
  }
}

function* unselectLocalStethoscope(action) {
  try {
    if (action.localStethoscope) {
      const remoteSpeaker = yield select(
        (state) => state.devices.remoteSpeaker
      );
      if (remoteSpeaker) {
        const localStethoscopes = yield select(
          (state) => state.feature_stethoscope.localStethoscopes
        );
        if (
          localStethoscopes.find((mic) => mic.id === action.localStethoscope.id)
        ) {
          yield callProvider.unselectLocalStethoscope(
            action.localStethoscope,
            remoteSpeaker
          );
          console.log(
            `SpecialLocalMicrophone: ${action.localStethoscope.name}, removed from remote speaker`
          );
        }
      }
    }
    yield put({
      type: actionTypes.UNSELECT_LOCAL_STETHOSCOPE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.UNSELECT_LOCAL_STETHOSCOPE_FAILED,
      message: e.message,
    });
  }
}

function* selectRemoteStethoscope(action) {
  try {
    const { selectedRemoteStethoscope, isRemoteStethoscopeStarted } =
      yield select((state) => state.feature_stethoscope);
    if (selectedRemoteStethoscope && isRemoteStethoscopeStarted) {
      yield put(actions.stopRemoteStethoscope());
    }
    yield put({
      type: actionTypes.SELECT_REMOTE_STETHOSCOPE_SUCCEEDED,
      stethoscope: action.remoteStethoscope,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SELECT_REMOTE_STETHOSCOPE_FAILED,
      message: e.message,
    });
  }
}

function* unselectRemoteStethoscope() {
  try {
    const { selectedRemoteStethoscope, isRemoteStethoscopeStarted } =
      yield select((state) => state.feature_stethoscope);
    if (selectedRemoteStethoscope && isRemoteStethoscopeStarted) {
      yield put(actions.stopRemoteStethoscope());
    }
    yield put({
      type: actionTypes.UNSELECT_REMOTE_STETHOSCOPE_SUCCEEDED,
      result: true,
    });
  } catch (e) {
    yield put({
      type: actionTypes.UNSELECT_REMOTE_STETHOSCOPE_FAILED,
      message: e.message,
    });
  }
}

function* startRemoteStethoscope(action) {
  try {
    const { selectedSpeaker } = yield select((state) => state.devices);
    const result = yield callProvider.startRemoteStethoscope(
      action.remoteStethoscope,
      selectedSpeaker
    );
    yield callProvider.disableDynamicAudioSources();
    yield put({
      type: actionTypes.START_REMOTE_STETHOSCOPE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.START_REMOTE_STETHOSCOPE_FAILED,
      message: e.message,
    });
  }
}

function* stopRemoteStethoscope() {
  try {
    const { selectedSpeaker } = yield select((state) => state.devices);
    const { selectedRemoteStethoscope } = yield select(
      (state) => state.feature_stethoscope
    );
    const result = yield callProvider.stopRemoteStethoscope(
      selectedRemoteStethoscope,
      selectedSpeaker
    );
    yield callProvider.enableDynamicAudioSources();
    yield put({
      type: actionTypes.STOP_REMOTE_STETHOSCOPE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.STOP_REMOTE_STETHOSCOPE_FAILED,
      message: e.message,
    });
  }
}

function* subscribeOnUnprocessedAudioUpdates() {
  try {
    const unprocessedAudioUpdatesChannel =
      createUnprocessedAudioUpdatesChannel();
    yield takeLatest(
      unprocessedAudioUpdatesChannel,
      handleUnprocessedAudioUpdates
    );
    yield put({
      type: actionTypes.UNPROCESSED_AUDIO_UPDATES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.UNPROCESSED_AUDIO_UPDATES_SUBSCRIBE_FAILED,
      message: e.message,
    });
  }
}

function createUnprocessedAudioUpdatesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnUnprocessedAudioUpdates(
      (payload) => void emit(payload)
    );
    return () => {
      callProvider.unsubscribeFromUnprocessedAudioUpdates();
    };
  });
}

function* handleUnprocessedAudioUpdates(payload) {
  switch (payload.event) {
    case "SUPPORT_CHANGED":
      yield put({
        type: actionTypes.STETHOSCOPE_SUPPORT_CHANGED,
        supported: payload.supported,
      });
      break;
    case "STARTED":
      if (payload.started) {
        yield put({ type: actionTypes.LOCAL_STETHOSCOPE_STARTED });
      } else {
        yield put({ type: actionTypes.LOCAL_STETHOSCOPE_STOPPED });
      }
      break;
    default:
  }
}

function* unsubscribeFromUnprocessedAudioUpdates() {
  try {
    const result = yield callProvider.unsubscribeFromUnprocessedAudioUpdates();

    yield put({
      type: actionTypes.UNPROCESSED_AUDIO_UPDATES_UNSUBSCRIBE_SUCCEEDED,
      payload: result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.UNPROCESSED_AUDIO_UPDATES_UNSUBSCRIBE_FAILED,
      message: e.message,
    });
  }
}

function* actionWatcher() {
  yield takeLatest(
    callActionTypes.GET_CALL_PROPERTIES_SUCCEEDED,
    handleCallStarted
  );
  yield takeLatest(callActionTypes.START_CALL_FAILED, handleCallFailed);
  yield takeLatest(callActionTypes.END_CALL_SUCCEEDED, handleCallEnded);
  yield takeLatest(
    devicesActionType.UPDATE_REMOTE_SPEAKER,
    handleRemoteSpeaker
  );
  yield takeLatest(
    devicesActionType.UPDATE_MICROPHONES,
    handleLocalMicrophones
  );
  yield takeLatest(
    devicesActionType.UPDATE_REMOTE_MICROPHONES,
    handleRemoteMicrophones
  );
  yield takeLatest(
    actionTypes.SELECT_REMOTE_STETHOSCOPE,
    selectRemoteStethoscope
  );
  yield takeLatest(
    actionTypes.UNSELECT_REMOTE_STETHOSCOPE,
    unselectRemoteStethoscope
  );
  yield takeLatest(
    actionTypes.START_REMOTE_STETHOSCOPE,
    startRemoteStethoscope
  );
  yield takeLatest(actionTypes.STOP_REMOTE_STETHOSCOPE, stopRemoteStethoscope);
  yield takeLatest(
    actionTypes.SELECT_LOCAL_STETHOSCOPE,
    selectLocalStethoscope
  );
  yield takeLatest(
    actionTypes.UNSELECT_LOCAL_STETHOSCOPE,
    unselectLocalStethoscope
  );
  yield takeLatest(
    actionTypes.UNPROCESSED_AUDIO_UPDATES_SUBSCRIBE,
    subscribeOnUnprocessedAudioUpdates
  );
  yield takeLatest(
    actionTypes.UNPROCESSED_AUDIO_UPDATES_UNSUBSCRIBE,
    unsubscribeFromUnprocessedAudioUpdates
  );
}

export default actionWatcher;
