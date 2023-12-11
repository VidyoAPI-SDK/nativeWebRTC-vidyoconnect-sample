import { put, takeLatest } from "redux-saga/effects";
import * as actionTypes from "./actions/types";
import axios from "axios";

function* createAdHocRoom() {
  try {
    const { data } = yield axios.post(
      window.appConfig.REACT_APP_CREATE_ROOM_SERVICE_API_URL
    );
    if (typeof data === "object") {
      const params = data.roomUrl?.split("/join/");
      yield put({
        type: actionTypes.CREATE_ADHOC_ROOM_SUCCEEDED,
        payload: {
          portal: params?.[0],
          roomKey: params?.[1],
          roomUrl: data.roomUrl,
          inviteContent: data.inviteContent,
          pin: data.pin,
        },
      });
    }
  } catch (err) {
    console.error(`Rest request error -> ${err}`);
    yield put({
      type: actionTypes.CREATE_ADHOC_ROOM_FAILED,
      error: err.toString(),
    });
  }
}

export default function* actionWatcher() {
  yield takeLatest(actionTypes.CREATE_ADHOC_ROOM, createAdHocRoom);
}
