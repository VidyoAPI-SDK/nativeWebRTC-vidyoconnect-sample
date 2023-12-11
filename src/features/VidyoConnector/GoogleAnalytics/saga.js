import { put, takeLatest } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import * as appActionTypes from "store/actions/types/app";
import * as actionTypes from "./actions/types";

const callProvider = getCallAPIProvider();

function* init(action) {
  try {
    if (action.payload.enableVcGa) {
      yield put({ type: actionTypes.ENABLE_GOOGLE_ANALYTICS });
    }
  } catch (e) {}
}

function* getAnalyticsEventTable() {
  try {
    const eventTable = yield callProvider.getAnalyticsEventTable();
    yield put({
      type: actionTypes.GET_ANALYTICS_EVENT_TABLE_SUCCEEDED,
      eventTable,
    });
  } catch (e) {
    yield put({
      type: actionTypes.GET_ANALYTICS_EVENT_TABLE_FAILED,
      message: e.message || e,
    });
  }
}

function* controlAnalyticsEventTable(action) {
  try {
    yield callProvider.controlAnalyticsEventTable(action.payload);
    yield put({
      type: actionTypes.CONTROL_ANALYTICS_EVENT_ACTION_SUCCEEDED,
      payload: action.payload,
    });
  } catch (e) {
    yield put({
      type: actionTypes.CONTROL_ANALYTICS_EVENT_ACTION_FAILED,
      message: e.message || e,
    });
  }
}

function* startAnalytics(action) {
  try {
    const result = yield callProvider.startAnalytics(action.payload);
    yield put({
      type: actionTypes.START_ANALYTICS_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.START_ANALYTICS_FAILED,
      message: e.message || e,
    });
  }
}

function* stopAnalytics(action) {
  try {
    const result = yield callProvider.stopAnalytics(action.payload);
    if (result) {
      yield put({
        type: actionTypes.STOP_ANALYTICS_SUCCEEDED,
      });
    }
  } catch (e) {
    yield put({
      type: actionTypes.STOP_ANALYTICS_FAILED,
      message: e.message || e,
    });
  }
}

export default function* actionWatcher() {
  yield takeLatest(appActionTypes.INIT, init);
  yield takeLatest(appActionTypes.INIT_SUCCEEDED, getAnalyticsEventTable);
  yield takeLatest(
    actionTypes.CONTROL_ANALYTICS_EVENT_ACTION,
    controlAnalyticsEventTable
  );
  yield takeLatest(actionTypes.START_ANALYTICS, startAnalytics);
  yield takeLatest(actionTypes.STOP_ANALYTICS, stopAnalytics);
}
