import { eventChannel } from "redux-saga";
import { put, call, select, takeLatest } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import * as actionTypes from "../../actions/types/devices";
import * as actions from "../../actions/devices";
import storage from "utils/storage";

const callProvider = getCallAPIProvider();

function* speakerTurnOn(action) {
  try {
    const isSpeakerDisabled = yield select(
      (state) => state.devices.isSpeakerDisabled
    );

    if (isSpeakerDisabled) {
      throw Error("Speaker disabled");
    }

    const result = yield callProvider.speakerTurnOn();

    yield put({
      type: actionTypes.SPEAKER_TURN_ON_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SPEAKER_TURN_ON_FAILED,
      message: e?.message,
    });
  }
}

function* speakerTurnOff(action) {
  try {
    const result = yield callProvider.speakerTurnOff();

    yield put({
      type: actionTypes.SPEAKER_TURN_OFF_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SPEAKER_TURN_OFF_FAILED,
      message: e?.message,
    });
  }
}

function* selectSpeaker(action) {
  try {
    const result = yield callProvider.selectSpeaker(action.localSpeaker);
    storage.addItem("savedLocalSpeaker", action.localSpeaker.id);

    yield put({
      type: actionTypes.SELECT_SPEAKER_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SELECT_SPEAKER_FAILED,
      message: e?.message,
    });
  }
}

function* disableSpeaker(action) {
  try {
    yield put(actions.speakerTurnOff());

    yield put({
      type: actionTypes.DISABLE_SPEAKER_SUCCEEDED,
      disableReason: action.disableReason,
    });
  } catch (e) {
    yield put({
      type: actionTypes.DISABLE_SPEAKER_FAILED,
      message: e?.message,
    });
  }
}

function* subscribeOnSpeakersChanges() {
  try {
    const speakersChannel = yield call(createSpeakersChangesChannel);
    yield takeLatest(speakersChannel, handleSpeakersChanges);

    yield put({
      type: actionTypes.SPEAKERS_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SPEAKERS_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createSpeakersChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnSpeakersChanges((speakers) => {
      setTimeout(() => {
        emit(speakers);
      });
    });
    return () => {
      callProvider.unsubscribeOnSpeakersChanges();
    };
  });
}

function* handleSpeakersChanges(speakers) {
  yield put(actions.updateSpeakers(speakers));
}

function* unsubscribeFromSpeakersChanges() {
  try {
    const result = yield callProvider.unsubscribeFromSpeakersChanges();

    yield put({
      type: actionTypes.SPEAKERS_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SPEAKERS_CHANGES_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* actionWatcher() {
  yield takeLatest(actionTypes.SPEAKER_TURN_ON, speakerTurnOn);
  yield takeLatest(actionTypes.SPEAKER_TURN_OFF, speakerTurnOff);
  yield takeLatest(actionTypes.SELECT_SPEAKER, selectSpeaker);
  yield takeLatest(actionTypes.DISABLE_SPEAKER, disableSpeaker);
  yield takeLatest(
    actionTypes.SPEAKERS_CHANGES_SUBSCRIBE,
    subscribeOnSpeakersChanges
  );
  yield takeLatest(
    actionTypes.SPEAKERS_CHANGES_UNSUBSCRIBE,
    unsubscribeFromSpeakersChanges
  );
}

export default actionWatcher;
