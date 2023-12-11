import { put, takeLatest } from "redux-saga/effects";
import * as actionTypes from "../actions/types/user";
import { myAccountRequest } from "services/SoapAPIProvider/soapAPIRequests/myAccount";
import { getEntityDetailsByID } from "services/SoapAPIProvider/soapAPIRequests/getEntityDetailsByID";
import storage from "utils/storage";
import { Logout } from "../../services/SoapAPIProvider/soapAPIRequests/Logout";
import { getUserAccountType } from "services/SoapAPIProvider/soapAPIRequests/getUserAccountType";

function* setUser(action) {
  const { portal, authToken, source } = storage.getItem("user");
  try {
    const user = yield myAccountRequest(portal, authToken);
    const accountType = yield getUserAccountType(portal, authToken);
    const entity = yield getEntityDetailsByID(portal, authToken, user.entityID);
    yield put({
      type: actionTypes.SET_USER_SUCCEEDED,
      payload: { entity, portal, authToken, source, accountType },
    });
  } catch (e) {
    yield put({
      type: actionTypes.SET_USER_FAILED,
      message: e?.message || e,
    });
  }
}

function* logout() {
  const { portal, authToken } = storage.getItem("user") || {};
  try {
    if (portal && authToken) {
      storage.removeItem("user");
      yield put({
        type: actionTypes.RESET_USER,
      });
      yield Logout(portal, authToken);
      yield put({ type: actionTypes.LOGOUT_SUCCEEDED });
    } else {
      yield put({
        type: actionTypes.LOGOUT_FAILED,
        message: "User is already logged out",
      });
    }
  } catch (e) {
    yield put({
      type: actionTypes.LOGOUT_FAILED,
      message: e?.message || e,
    });
  }
}

function* actionWatcher() {
  yield takeLatest(actionTypes.SET_USER, setUser);
  yield takeLatest(actionTypes.LOGOUT, logout);
}

export default actionWatcher;
