import { call, put, takeLatest } from "redux-saga/effects";
import * as appActionTypes from "store/actions/types/app";
import * as actionTypes from "./actions/types";
import { eventChannel } from "redux-saga";

const element = document.documentElement;

function* initFullscreen() {
  try {
    const fullscreenChannel = yield call(createFullscreenChannel);
    yield takeLatest(fullscreenChannel, handleFullscreenChanges);
  } catch (err) {
    console.error(err);
  }
}

function* handleFullscreenChanges(isEnabled) {
  yield put({
    type: actionTypes.SET_FULLSCREEN_CHANGED,
    isEnabled,
  });
}

function createFullscreenChannel() {
  return eventChannel((emit) => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ?? document.webkitFullscreenElement;
      emit(fullscreenElement === element);
    };
    if ("onfullscreenchange" in document) {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    } else if ("onwebkitfullscreenchange" in document) {
      document.addEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    }
    return () => {
      if ("onfullscreenchange" in document) {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      } else if ("onwebkitfullscreenchange" in document) {
        document.removeEventListener(
          "webkitfullscreenchange",
          handleFullscreenChange
        );
      }
    };
  });
}

function* handleSetFullscreen(action) {
  try {
    if (action.enable) {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        throw new Error(
          "Some element is currently being presented in fullscreen mode"
        );
      }
      const requestFullscreen =
        element.requestFullscreen ?? element.webkitRequestFullScreen;
      requestFullscreen.call(element);
    } else {
      const exitFullscreen =
        document.exitFullscreen ?? document.webkitExitFullscreen;
      exitFullscreen.call(document);
    }
  } catch (err) {
    yield put({
      type: actionTypes.SET_FULLSCREEN_FAILED,
      error: err,
    });
  }
}

function* actionWatcher() {
  yield takeLatest(appActionTypes.INIT, initFullscreen);
  yield takeLatest(actionTypes.SET_FULLSCREEN, handleSetFullscreen);
}

export default actionWatcher;
