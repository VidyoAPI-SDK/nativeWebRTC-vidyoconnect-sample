import { eventChannel } from "redux-saga";
import { put, call, select, takeLatest } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import * as actionTypes from "../../actions/types/devices";
import * as actions from "../../actions/devices";
import * as googleAnalyticsActions from "../../actions/googleAnalytics";
import storage from "utils/storage";
import { deviceDisableReason } from "utils/constants";

const callProvider = getCallAPIProvider();

function* microphoneTurnOn() {
  try {
    const isMicrophoneDisabled = yield select(
      (state) => state.devices.isMicrophoneDisabled
    );

    if (isMicrophoneDisabled) {
      throw Error("Microphone disabled");
    }

    const microphoneModerationState = yield select(
      (state) => state.devices.microphoneModerationState
    );
    const isMicrophoneMutedByModerator =
      microphoneModerationState.moderationType ===
        deviceDisableReason.HARD_MUTED && microphoneModerationState.state;

    if (isMicrophoneMutedByModerator) {
      throw Error("Microphone hard muted by moderator");
    }

    const result = yield callProvider.microphoneTurnOn();

    yield put({
      type: actionTypes.MICROPHONE_TURN_ON_SUCCEEDED,
      result,
    });
    yield put({
      type: actionTypes.MICROPHONE_RESET_MODERATION_STATE,
    });
    yield put(googleAnalyticsActions.callDeviceState("micCapture"));
  } catch (e) {
    yield put({
      type: actionTypes.MICROPHONE_TURN_ON_FAILED,
      message: e?.message,
    });
  }
}

function* microphoneTurnOff() {
  try {
    const result = yield callProvider.microphoneTurnOff();

    yield put({
      type: actionTypes.MICROPHONE_TURN_OFF_SUCCEEDED,
      result,
    });
    yield put(googleAnalyticsActions.callDeviceState("micMuted"));
  } catch (e) {
    yield put({
      type: actionTypes.MICROPHONE_TURN_OFF_FAILED,
      message: e?.message,
    });
  }
}

function* selectMicrophone(action) {
  try {
    const result = yield callProvider.selectMicrophone(action.localMicrophone);
    storage.addItem("savedLocalMicrophone", action.localMicrophone.id);

    yield put({
      type: actionTypes.SELECT_MICROPHONE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SELECT_MICROPHONE_FAILED,
      message: e?.message,
    });
  }
}

function* disableMicrophone(action) {
  try {
    yield put(actions.microphoneTurnOff());

    yield put({
      type: actionTypes.DISABLE_MICROPHONE_SUCCEEDED,
      disableReason: action.disableReason,
    });
  } catch (e) {
    yield put({
      type: actionTypes.DISABLE_MICROPHONE_FAILED,
      message: e?.message,
    });
  }
}

function* subscribeOnMicrophonesChanges() {
  try {
    const microphonesChannel = yield call(createMicrophonesChangesChannel);
    yield takeLatest(microphonesChannel, handleMicrophonesChanges);

    yield put({
      type: actionTypes.MICROPHONES_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.MICROPHONES_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createMicrophonesChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnMicrophonesChanges((microphones) => {
      setTimeout(() => {
        emit(microphones);
      });
    });
    return () => {
      callProvider.unsubscribeFromMicrophonesChanges();
    };
  });
}

function* handleMicrophonesChanges(microphones) {
  yield put(actions.updateMicrophones(microphones));
}

function* unsubscribeFromMicrophonesChanges() {
  try {
    const result = yield callProvider.unsubscribeFromMicrophonesChanges();

    yield put({
      type: actionTypes.MICROPHONES_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.MICROPHONES_CHANGES_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* actionWatcher() {
  yield takeLatest(actionTypes.MICROPHONE_TURN_ON, microphoneTurnOn);
  yield takeLatest(actionTypes.MICROPHONE_TURN_OFF, microphoneTurnOff);
  yield takeLatest(actionTypes.SELECT_MICROPHONE, selectMicrophone);
  yield takeLatest(actionTypes.DISABLE_MICROPHONE, disableMicrophone);
  yield takeLatest(
    actionTypes.MICROPHONES_CHANGES_SUBSCRIBE,
    subscribeOnMicrophonesChanges
  );
  yield takeLatest(
    actionTypes.MICROPHONES_CHANGES_UNSUBSCRIBE,
    unsubscribeFromMicrophonesChanges
  );
}

export default actionWatcher;
