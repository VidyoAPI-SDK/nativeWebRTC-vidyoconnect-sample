import { put, takeLatest } from "redux-saga/effects";
import { setShareSystemPermissionError } from "./actions/creators";
import * as callActionTypes from "store/actions/types/call";

function* shareStartFailed(action) {
  if (action.message === "Permission denied by system") {
    yield put(
      setShareSystemPermissionError({ value: true, shareErrorType: "system" })
    );
  } else {
    yield put(
      setShareSystemPermissionError({ value: true, shareErrorType: "other" })
    );
  }
}

export default function* actionWatcher() {
  yield takeLatest(callActionTypes.WINDOW_SHARE_START_FAILED, shareStartFailed);
}
