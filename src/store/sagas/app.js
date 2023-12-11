import { eventChannel, buffers } from "redux-saga";
import { put, call, takeLatest, select } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import { getChatAPIProvider } from "services/ChatAPIProvider";
import { deviceDisableReason } from "utils/constants";
import * as callActions from "../actions/call";
import * as deviceActions from "../actions/devices";
import * as actionTypes from "../actions/types/app";
import * as appActions from "../actions/app";
import * as googleAnalyticsActions from "../actions/googleAnalytics";
import * as configActions from "../actions/config";

const callProvider = getCallAPIProvider();
const chatProvider = getChatAPIProvider();

// In product info we also ca set extData in a feature
const productInfo = {
  applicationName: window.appConfig.REACT_APP_ANALYTICS_NAME,
  applicationVersion: window.appConfig.APP_VERSION,
};

function* init(action) {
  try {
    yield callProvider.init(action.payload);
    yield chatProvider.init(action.payload);

    yield put(configActions.setProductInfo(productInfo));

    if (!action.payload.skipPermissionsCheck) {
      yield put(appActions.subscribeOnPermissionsChanges());
    }

    yield put(deviceActions.registerLocalCameraStreamInterceptor());

    yield put(deviceActions.subscribeOnCamerasChanges());
    yield put(deviceActions.subscribeOnMicrophonesChanges());
    yield put(deviceActions.subscribeOnSpeakersChanges());

    yield put(deviceActions.microphoneTurnOff());
    yield put(deviceActions.cameraTurnOff());

    yield put({
      type: actionTypes.RECONNECT_CHANGES_SUBSCRIBE,
    });
    yield put({
      type: actionTypes.INIT_SUCCEEDED,
    });
    yield put(googleAnalyticsActions.appLaunch("roomLink"));
  } catch (e) {
    yield put({
      type: actionTypes.INIT_FAILED,
      message: e?.message,
    });
  }
}

function* unInit(action) {
  try {
    yield callProvider.desctructEndpoint();
  } catch (e) {}
}

function* generateLogs(action) {
  try {
    const curentState = yield select();
    yield callProvider.createLogs(curentState);
    yield put({
      type: actionTypes.GENERATE_LOGS_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.GENERATE_LOGS_FAILED,
      message: e?.message,
    });
  }
}

function* enableDebugLogLevel(action) {
  try {
    yield callProvider.elevateLogs();
  } catch (e) {
    console.error(e);
  }
}

function* diactivateTab(action) {
  yield callProvider.desctructEndpoint();
}

function* subscribeOnPermissionsChanges(action) {
  try {
    const permissionsChannel = yield call(createPermissionsChannel);
    yield takeLatest(permissionsChannel, handlePermissionsChanges);

    yield put({
      type: actionTypes.PERMISSIONS_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.PERMISSIONS_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createPermissionsChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnPermissionsChanges((type, isPermitted) => {
      setTimeout(() => {
        emit({ type, isPermitted });
      });
    });
    return () => {
      callProvider.unsubscribeFromPermissionsChanges();
    };
  }, buffers.expanding());
}

function* handlePermissionsChanges({ type, isPermitted }) {
  if (type === "VIDYO_PERMISSION_Camera") {
    if (isPermitted) {
      yield put(deviceActions.enableCamera(deviceDisableReason.NO_PERMISSION));
    } else {
      yield put(deviceActions.disableCamera(deviceDisableReason.NO_PERMISSION));
    }
  }
  if (type === "VIDYO_PERMISSION_Microphone") {
    if (isPermitted) {
      yield put(
        deviceActions.enableMicrophone(deviceDisableReason.NO_PERMISSION)
      );
    } else {
      yield put(
        deviceActions.disableMicrophone(deviceDisableReason.NO_PERMISSION)
      );
    }
  }
}

function* subscribeOnReconnectUpdates() {
  try {
    const unprocessedAudioUpdatesChannel = createReconnectUpdatesChannel();
    yield takeLatest(unprocessedAudioUpdatesChannel, handleReconnectUpdates);
    yield put({
      type: actionTypes.RECONNECT_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.RECONNECT_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createReconnectUpdatesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnReconnectStateChange((payload) => {
      setTimeout(() => {
        emit(payload);
      });
    });

    return () => {};
  });
}

function* handleReconnectUpdates(payload) {
  switch (payload.event) {
    case "CONFERENCE_LOST":
      yield put({ type: actionTypes.CONFERENCE_LOST});
      break;
    case "RECONNECTED":
      yield put(configActions.getJwtToken());
      yield put(callActions.setCcBtnIsActive(false)); // STOP ClosedCaptioning
      yield put({ type: actionTypes.RECONNECTED_SUCCEEDED });
      break;
    case "RECONNECTING":
      yield put({ type: actionTypes.CALL_RECONNECTING});
      break;
    default:
      break;
  }
}

function* actionWatcher() {
  yield takeLatest(actionTypes.INIT, init);
  yield takeLatest(actionTypes.UNINIT, unInit);
  yield takeLatest(actionTypes.GENERATE_LOGS, generateLogs);
  yield takeLatest(actionTypes.ENABLE_DEBUG_LOG_LEVEL, enableDebugLogLevel);
  yield takeLatest(actionTypes.DIACTIVATE_TAB, diactivateTab);
  yield takeLatest(
    actionTypes.PERMISSIONS_CHANGES_SUBSCRIBE,
    subscribeOnPermissionsChanges
  );
  yield takeLatest(
    actionTypes.RECONNECT_CHANGES_SUBSCRIBE,
    subscribeOnReconnectUpdates
  );
}

export default actionWatcher;
