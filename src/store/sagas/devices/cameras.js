import { eventChannel } from "redux-saga";
import { put, call, select, takeLatest } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import * as actionTypes from "../../actions/types/devices";
import * as actions from "../../actions/devices";
import * as googleAnalyticsActions from "../../actions/googleAnalytics";
import storage from "utils/storage";
import { deviceDisableReason } from "utils/constants";

const callProvider = getCallAPIProvider();

function* cameraTurnOn(action) {
  try {
    const isCameraDisabled = yield select(
      (state) => state.devices.isCameraDisabled
    );

    if (isCameraDisabled) {
      throw Error("Camera disabled");
    }

    const cameraModerationState = yield select(
      (state) => state.devices.cameraModerationState
    );
    const isCameraMutedByModerator =
      cameraModerationState.moderationType === deviceDisableReason.HARD_MUTED &&
      cameraModerationState.state;

    if (isCameraMutedByModerator) {
      throw Error("Camera hard muted by moderator");
    }

    const result = yield callProvider.cameraTurnOn(action.selectedCamera);
    yield put({
      type: actionTypes.CAMERA_TURN_ON_SUCCEEDED,
      result,
    });
    yield put({
      type: actionTypes.CAMERA_RESET_MODERATION_STATE,
    });
    yield put(googleAnalyticsActions.callDeviceState("cameraCapture"));
  } catch (e) {
    yield put({
      type: actionTypes.CAMERA_TURN_ON_FAILED,
      message: e?.message,
    });
  }
}

function* cameraTurnOff(action) {
  try {
    const result = yield callProvider.cameraTurnOff(action.selectedCamera);

    yield put({
      type: actionTypes.CAMERA_TURN_OFF_SUCCEEDED,
      result,
    });
    yield put(googleAnalyticsActions.callDeviceState("cameraMuted"));
  } catch (e) {
    yield put({
      type: actionTypes.CAMERA_TURN_OFF_FAILED,
      message: e?.message,
    });
  }
}

function* selectCamera(action) {
  try {
    const result = yield callProvider.selectCamera(action.localCamera);
    storage.addItem("savedLocalCamera", action.localCamera.id);

    yield put({
      type: actionTypes.SELECT_CAMERA_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SELECT_CAMERA_FAILED,
      message: e?.message,
    });
  }
}

function* disableCamera(action) {
  try {
    yield put(actions.cameraTurnOff());

    yield put({
      type: actionTypes.DISABLE_CAMERA_SUCCEEDED,
      disableReason: action.disableReason,
    });
  } catch (e) {
    yield put({
      type: actionTypes.DISABLE_CAMERA_FAILED,
      message: e?.message,
    });
  }
}

function* cycleCamera(action) {
  try {
    const result = yield callProvider.cycleCamera();

    yield put({
      type: actionTypes.CYCLE_CAMERA_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.CYCLE_CAMERA_FAILED,
      message: e?.message,
    });
  }
}

function* registerLocalCameraStreamInterceptor() {
  try {
    const result = yield callProvider.registerLocalCameraStreamInterceptor();

    yield put({
      type: actionTypes.REGISTER_LOCAL_CAMERA_STREAM_INTERCEPTOR_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.REGISTER_LOCAL_CAMERA_STREAM_INTERCEPTOR_FAILED,
      message: e?.message,
    });
  }
}

function* subscribeOnCamerasChanges() {
  try {
    const camerasChannel = yield call(createCamerasChangesChannel);
    yield takeLatest(camerasChannel, handleCamerasChanges);

    yield put({
      type: actionTypes.CAMERAS_CHANGES_SUBSCRIBE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.CAMERAS_CHANGES_SUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function createCamerasChangesChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnCamerasChanges((cameras) => {
      setTimeout(() => {
        emit(cameras);
      });
    });
    return () => {
      callProvider.unsubscribeOnCamerasChanges();
    };
  });
}

function* handleCamerasChanges(cameras) {
  yield put(actions.updateCameras(cameras));
}

function* unsubscribeFromCamerasChanges() {
  try {
    const result = yield callProvider.unsubscribeFromCamerasChanges();

    yield put({
      type: actionTypes.CAMERAS_CHANGES_UNSUBSCRIBE_SUCCEEDED,
      result,
    });
  } catch (e) {
    yield put({
      type: actionTypes.CAMERAS_CHANGES_UNSUBSCRIBE_FAILED,
      message: e?.message,
    });
  }
}

function* actionWatcher() {
  yield takeLatest(actionTypes.CAMERA_TURN_ON, cameraTurnOn);
  yield takeLatest(actionTypes.CAMERA_TURN_OFF, cameraTurnOff);
  yield takeLatest(actionTypes.SELECT_CAMERA, selectCamera);
  yield takeLatest(actionTypes.DISABLE_CAMERA, disableCamera);
  yield takeLatest(actionTypes.CYCLE_CAMERA, cycleCamera);
  yield takeLatest(
    actionTypes.CAMERAS_CHANGES_SUBSCRIBE,
    subscribeOnCamerasChanges
  );
  yield takeLatest(
    actionTypes.CAMERAS_CHANGES_UNSUBSCRIBE,
    unsubscribeFromCamerasChanges
  );
  yield takeLatest(
    actionTypes.REGISTER_LOCAL_CAMERA_STREAM_INTERCEPTOR,
    registerLocalCameraStreamInterceptor
  );
}

export default actionWatcher;
