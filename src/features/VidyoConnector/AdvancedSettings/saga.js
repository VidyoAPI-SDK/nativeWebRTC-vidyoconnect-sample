import { eventChannel, buffers } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import * as configActions from "store/actions/config";
import * as appActionTypes from "store/actions/types/app";
import * as actionTypes from "./actions/types";

const callProvider = getCallAPIProvider();

function* registerEvents() {
  try {
    const advancedConfigChannel = yield call(createAdvancedConfigChannel);
    yield takeLatest(advancedConfigChannel, handleAdvancedConfigChanges);
  } catch (e) {}
}

function createAdvancedConfigChannel() {
  return eventChannel((emit) => {
    callProvider.subscribeOnAdvancedSettingsChanges((config) => {
      for (let [configName, configValue] of Object.entries(config)) {
        emit({ configName, configValue });
      }
    });
    return () => {};
  }, buffers.expanding());
}

function* handleAdvancedConfigChanges({ configName, configValue }) {
  switch (configName) {
    case "disableStats":
      yield put({
        type: actionTypes.STATS_DISABLED,
        disabled: configValue,
      });
      break;
    case "enableCompositorFixedParticipants":
      yield put({
        type: actionTypes.COMPOSITOR_FIXED_PARTICIPANTS_CHANGED,
        enabled: configValue,
      });
      break;
    case "enableVideoSimulcast":
      yield put({
        type: actionTypes.VIDEO_SIMULCAST_CHANGED,
        enabled: configValue,
      });
      break;
    case "enableScreenShareSimulcast":
      yield put({
        type: actionTypes.SCREENSHARE_SIMULCAST_CHANGED,
        enabled: configValue,
      });
      break;
    case "participantLimit":
      yield put({
        type: actionTypes.PARTICIPANT_LIMIT_CHANGED,
        limit: configValue,
      });
      break;
    case "showStatisticsOverlay":
      yield put({
        type: actionTypes.SHOW_STATS_OVERLAY_CHANGED,
        displayed: configValue,
      });
      break;
    case "enableAudioOnlyMode":
      yield put({
        type: actionTypes.AUDIO_ONLY_MODE_CHANGED,
        enabled: configValue,
      });
      break;
    case "autoReconnectEnabled":
      yield put({
        type: actionTypes.AUTO_RECONNECT_CHANGED,
        enabled: configValue,
      });
      break;
    case "maxReconnectAttempts":
      yield put({
        type: actionTypes.MAX_RECONNECT_ATTEMPTS_CHANGED,
        maxAttempts: configValue,
      });
      break;
    case "reconnectBackoff":
      yield put({
        type: actionTypes.RECONNECT_BACKOFF_CHANGED,
        backoff: configValue,
      });
      break;
    case "enableSimpleAPILogging":
      yield put({
        type: actionTypes.SIMPLE_API_LOGGING_CHANGED,
        enabled: configValue,
      });
      break;
    case "enableVidyoConnectorAPILogging":
      yield put({
        type: actionTypes.CONNECTOR_API_LOGGING_CHANGED,
        enabled: configValue,
      });
      break;
    case "logLevel":
      yield put({
        type: actionTypes.LOG_LEVELS_CHANGED,
        logLevels: configValue,
      });
      break;
    case "logCategory":
      yield put({
        type: actionTypes.LOG_CATEGORIES_CHANGED,
        logCategories: configValue,
      });
      break;
    case "activeLogs":
      yield put({
        type: actionTypes.ACTIVE_LOGS_CHANGED,
        activeLogs: configValue,
      });
      break;
    default:
  }
}

function* addLogCategory(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      addLogCategory: action.logCategory,
    });
  } catch (e) {
    yield put({
      type: actionTypes.ADD_LOG_CATEGORY_FAILED,
      message: e.message || e,
    });
  }
}

function* disableStats(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      disableStats: action.disable,
    });
  } catch (e) {
    yield put({
      type: actionTypes.DISABLE_STATS_FAILED,
      message: e.message || e,
    });
  }
}

function* setAudioOnlyMode(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      enableAudioOnlyMode: action.enabled,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_AUDIO_ONLY_MODE_FAILED,
      message: e.message || e,
    });
  }
}

function* setAutoReconnect(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      enableAutoReconnect: action.enabled,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_AUTO_RECONNECT_FAILED,
      message: e.message || e,
    });
  }
}

function* setCompositorFixedParticipants(action) {
  try {
    yield put(
      configActions.setCompositorFixedParticipants({
        enableCompositorFixedParticipants: action.enabled,
      })
    );
  } catch (e) {
    yield put({
      type: actionTypes.SET_COMPOSITOR_FIXED_PARTICIPANTS_FAILED,
      message: e.message || e,
    });
  }
}

function* setSimpleAPILogging(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      enableSimpleAPILogging: action.enabled,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_SIMPLE_API_LOGGING_FAILED,
      message: e.message || e,
    });
  }
}

function* setVideoSimulcast(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      enableVideoSimulcast: action.enabled,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_VIDEO_SIMULCAST_FAILED,
      message: e.message || e,
    });
  }
}

function* setScreenShareSimulcast(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      enableScreenShareSimulcast: action.enabled,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_SCREENSHARE_SIMULCAST_FAILED,
      message: e.message || e,
    });
  }
}

function* setVidyoConnectorAPILogging(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      enableVidyoConnectorAPILogging: action.enabled,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_CONNECTOR_API_LOGGING_FAILED,
      message: e.message || e,
    });
  }
}

function* setMaxReconnectAttempts(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      maxReconnectAttempts: action.maxAttempts,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_MAX_RECONNECT_ATTEMPTS_FAILED,
      message: e.message || e,
    });
  }
}

function* setParticipantLimit(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      participantLimit: action.limit,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_PARTICIPANT_LIMIT_FAILED,
      message: e.message || e,
    });
  }
}

function* setReconnectBackoff(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      reconnectBackoff: action.backoff,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_RECONNECT_BACKOFF_FAILED,
      message: e.message || e,
    });
  }
}

function* showStatisticsOverlay(action) {
  try {
    yield put(configActions.setStatisticsOverlay(action.show));
  } catch (e) {
    yield put({
      type: actionTypes.SHOW_STATS_OVERLAY_FAILED,
      message: e.message || e,
    });
  }
}

export default function* actionWatcher() {
  yield takeLatest(appActionTypes.INIT_SUCCEEDED, registerEvents);
  yield takeLatest(actionTypes.ADD_LOG_CATEGORY, addLogCategory);
  yield takeLatest(actionTypes.DISABLE_STATS, disableStats);
  yield takeLatest(actionTypes.SET_AUDIO_ONLY_MODE, setAudioOnlyMode);
  yield takeLatest(actionTypes.SET_AUTO_RECONNECT, setAutoReconnect);
  yield takeLatest(
    actionTypes.SET_COMPOSITOR_FIXED_PARTICIPANTS,
    setCompositorFixedParticipants
  );
  yield takeLatest(
    actionTypes.SET_CONNECTOR_API_LOGGING,
    setVidyoConnectorAPILogging
  );
  yield takeLatest(actionTypes.SET_SIMPLE_API_LOGGING, setSimpleAPILogging);
  yield takeLatest(actionTypes.SET_VIDEO_SIMULCAST, setVideoSimulcast);
  yield takeLatest(
    actionTypes.SET_SCREENSHARE_SIMULCAST,
    setScreenShareSimulcast
  );
  yield takeLatest(
    actionTypes.SET_MAX_RECONNECT_ATTEMPTS,
    setMaxReconnectAttempts
  );
  yield takeLatest(actionTypes.SET_PARTICIPANT_LIMIT, setParticipantLimit);
  yield takeLatest(actionTypes.SET_RECONNECT_BACKOFF, setReconnectBackoff);
  yield takeLatest(actionTypes.SHOW_STATS_OVERLAY, showStatisticsOverlay);
}
