import { put, takeLatest, call } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import { Login } from "services/SoapAPIProvider/soapAPIRequests/Login";
import * as actionTypes from "../actions/types/config";
import APIClient from "../../services/APIClient";
import * as googleAnalyticsActions from "../actions/googleAnalytics";
import storage from "../../utils/storage";

const callProvider = getCallAPIProvider();

function* setExtData(action) {
  try {
    yield callProvider.setAdvancedConfiguration(action.payload);
    yield put({
      type: actionTypes.SET_EXT_DATA_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_EXT_DATA_FAILED,
      message: e?.message || e,
    });
  }
}

function* setCompositorFixedParticipants(action) {
  try {
    yield callProvider.setAdvancedConfiguration(action.payload);
  } catch (e) {
    yield put({
      type: actionTypes.SET_COMPOSITOR_FIXED_PARTICIPANTS_FAILED,
      message: e?.message || e,
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
      message: e?.message || e,
    });
  }
}

function* disableTabletParticipantLimitRestrictions(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      disableTabletParticipantLimitRestrictions: action.disable,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_DISABLE_PARTICIPANT_RESTRICTIONS_TABLET_FAILED,
      message: e?.message || e,
    });
  }
}

function* setStatisticsOverlay(action) {
  try {
    yield callProvider.setAdvancedConfiguration({
      showStatisticsOverlay: action.show,
    });
    yield put({
      type: actionTypes.SET_STATISTICS_OVERLAY_SUCCEEDED,
      show: action.show,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_STATISTICS_OVERLAY_FAILED,
      message: e?.message || e,
    });
  }
}

function* setP2PConnection(action) {
  try {
    yield callProvider.setP2PConnection(action.payload);
    yield put({
      type: actionTypes.SET_P2P_CONNECTION_SUCCEEDED,
    });
    yield put(googleAnalyticsActions.joinP2PCall());
  } catch (e) {
    yield put({
      type: actionTypes.SET_P2P_CONNECTION_FAILED,
      message: e?.message || e,
    });
  }
}

function* getCustomParameters(action) {
  try {
    const result = yield call(APIClient.getCustomParameters, action.payload);
    if (result) {
      action.callback(result);
      yield put({
        type: actionTypes.GET_CUSTOM_PARAMETERS_SUCCEEDED,
        payload: result,
      });
    } else {
      action.callback(false);
      yield put({
        type: actionTypes.GET_CUSTOM_PARAMETERS_FAILED,
      });
    }
  } catch (e) {
    action.callback(false);
    yield put({
      type: actionTypes.GET_CUSTOM_PARAMETERS_FAILED,
      message: e?.message,
    });
  }
}

function* sendSMS(action) {
  try {
    const result = yield call(APIClient.sendSMS, action.payload);
    if (result) {
      action.callback(true);
      yield put({
        type: actionTypes.SEND_SMS_SUCCEEDED,
        payload: result,
      });
    } else {
      action.callback(false);
      yield put({
        type: actionTypes.SEND_SMS_FAILED,
      });
    }
  } catch (e) {
    action.callback(false);
    yield put({
      type: actionTypes.SEND_SMS_FAILED,
      message: e?.message,
    });
  }
}

function* getGCPServicesList(action) {
  try {
    const result = yield call(APIClient.getGCPServicesList, action.payload);
    if (result) {
      action.callback(result);
      yield put({
        type: actionTypes.GET_GCP_SERVICES_LIST_SUCCEEDED,
        payload: result,
      });
    } else {
      action.callback(false);
      yield put({
        type: actionTypes.GET_GCP_SERVICES_LIST_FAILED,
      });
    }
  } catch (e) {
    action.callback(false);
    yield put({
      type: actionTypes.GET_GCP_SERVICES_LIST_FAILED,
      message: e?.message,
    });
  }
}

function* getEndpointBehaviour() {
  try {
    const { portal, authToken } = storage.getItem("user") || {};
    const result = yield call(Login, portal, authToken, {
      returnEndpointBehavior: true,
    });
    if (result?.endpointBehavior) {
      yield put({
        type: actionTypes.GET_ENDPOINT_BEHAVIOUR_SUCCEEDED,
        payload: result.endpointBehavior,
      });
    } else {
      yield put({
        type: actionTypes.GET_ENDPOINT_BEHAVIOUR_FAILED,
        message: "endpointBehavior parameter is null or not found",
      });
    }
  } catch (e) {
    yield put({
      type: actionTypes.GET_ENDPOINT_BEHAVIOUR_FAILED,
      message: e?.message,
    });
  }
}

function* setGeolocationURL(action) {
  try {
    yield callProvider.setAdvancedConfiguration(action.payload);
    yield put({
      type: actionTypes.SET_GEOLOCATION_URL_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_GEOLOCATION_URL_FAILED,
      message: e?.message || e,
    });
  }
}

function* setProductInfo(action) {
  try {
    yield callProvider.setProductInfo(action.payload);
    yield put({
      type: actionTypes.SET_PRODUCT_INFO_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_PRODUCT_INFO_FAILED,
      message: e?.message || e,
    });
  }
}

function* getJWTToken() {
  try {
    const tokens = yield callProvider.getJWTToken();
    if (tokens?.jwtToken) {
      yield put({
        type: actionTypes.GET_JWT_TOKEN_SUCCEEDED,
        payload: tokens.jwtToken,
      });
    } else {
      yield put({
        type: actionTypes.GET_JWT_TOKEN_FAILED,
        message: "jwtToken is empty or null",
      });
    }
    if (tokens?.refreshToken) {
      yield put({
        type: actionTypes.GET_REFRESH_TOKEN_SUCCEEDED,
        payload: tokens?.refreshToken,
      });
    } else {
      yield put({
        type: actionTypes.GET_REFRESH_TOKEN_FAILED,
        message: "refreshToken is empty or null",
      });
    }
  } catch (e) {
    yield put({
      type: actionTypes.GET_JWT_TOKEN_FAILED,
      message: (e && e?.message) || e || "jwtToken is empty or null",
    });
  }
}

function* actionWatcher() {
  yield takeLatest(actionTypes.SET_EXT_DATA, setExtData);
  yield takeLatest(
    actionTypes.SET_COMPOSITOR_FIXED_PARTICIPANTS,
    setCompositorFixedParticipants
  );
  yield takeLatest(actionTypes.SET_STATISTICS_OVERLAY, setStatisticsOverlay);
  yield takeLatest(actionTypes.GET_CUSTOM_PARAMETERS, getCustomParameters);
  yield takeLatest(actionTypes.GET_GCP_SERVICES_LIST, getGCPServicesList);
  yield takeLatest(actionTypes.GET_ENDPOINT_BEHAVIOUR, getEndpointBehaviour);
  yield takeLatest(actionTypes.SEND_SMS, sendSMS);
  yield takeLatest(actionTypes.SET_PARTICIPANT_LIMIT, setParticipantLimit);
  yield takeLatest(
    actionTypes.SET_DISABLE_PARTICIPANT_RESTRICTIONS_TABLET,
    disableTabletParticipantLimitRestrictions
  );
  yield takeLatest(actionTypes.SET_GEOLOCATION_URL, setGeolocationURL);
  yield takeLatest(actionTypes.SET_PRODUCT_INFO, setProductInfo);
  yield takeLatest(actionTypes.GET_JWT_TOKEN, getJWTToken);
  yield takeLatest(actionTypes.SET_P2P_CONNECTION, setP2PConnection);
}

export default actionWatcher;
