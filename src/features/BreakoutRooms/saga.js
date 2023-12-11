import { call, put, select, takeLatest } from "redux-saga/effects";
import { getCallAPIProvider } from "services/CallAPIProvider";
import * as breakoutActions from "./actions/creators";
import * as breakoutTypes from "./actions/types";
import * as callActionTypes from "../../store/actions/types/call";
import * as userActionTypes from "../../store/actions/types/user";
import * as callActions from "../../store/actions/call";
import * as chatActions from "../../store/actions/chat";
import BreakoutRoomsProvider from "./providers/BreakoutRoomsProvider";
import store from "store/store";

const callProvider = getCallAPIProvider();

function* handleTransferStarted(action) {
  try {
    yield console.log("BREAKOUT_ROOMS: Call transfer started");
    const breakoutRooms = yield select((state) => state.feature_breakoutRooms);

    yield put(breakoutActions.setTransferInProgress(true));
    yield put(callActions.setCcBtnIsActive(false));
    yield put(chatActions.closeChatChanel());

    if (breakoutRooms.raiseHandButtonActive) {
      yield put(breakoutActions.setIsRaiseHandRequestInProgress(false));
      yield put(breakoutActions.setIsRaiseHandButtonActive(false));
    }
    yield put(breakoutActions.setIsRoomBreakout(false));
  } catch (e) {
    yield console.log("BREAKOUT_ROOMS: Error while handleTransferStarted", e);
    yield* resetState();
  }
}

function* handleTransferFinished() {
  const breakoutRooms = yield select((state) => state.feature_breakoutRooms);
  const properties = yield callProvider.getCallProperties();
  yield put({
    type: callActionTypes.GET_CALL_PROPERTIES_SUCCEEDED,
    properties,
  });

  yield console.log(
    `BREAKOUT_ROOMS: Call transfer finished. ConferenceId = ${properties?.conferenceId}, MainConferenceId = ${breakoutRooms.mainConferenceId}`
  );

  yield put(breakoutActions.setIsShowAfterMovingNotification(true));

  if (properties?.conferenceId !== breakoutRooms.mainConferenceId) {
    yield put(breakoutActions.setIsRoomBreakout(true));
  } else {
    yield put(breakoutActions.setIsRoomBreakout(false));
  }
  yield put(breakoutActions.setTransferInProgress(false));
}

function* resetState() {
  yield console.log(`BREAKOUT_ROOMS: Reset state`);
  yield put(breakoutActions.setMainRoomId(""));
  yield put(breakoutActions.setIsRoomBreakout(false));
  yield put(breakoutActions.setTransferInProgress(false));
  yield put(breakoutActions.setIsShowAfterMovingNotification(false));
  yield put(breakoutActions.setIsRaiseHandRequestInProgress(false));
  yield put(breakoutActions.setIsRaiseHandButtonActive(false));
  yield put(breakoutActions.setIsShowBreakoutLeftDialog(false));
}

function* handleTransferFailed() {
  yield* resetState();
}

function* handleCallEnded() {
  yield* resetState();
}

function* raiseHand() {
  try {
    yield put(breakoutActions.setIsRaiseHandButtonActive(true));
    yield put(breakoutActions.setIsRaiseHandRequestInProgress(true));
    yield call(BreakoutRoomsProvider.raiseHand, (status) => {
      console.log(`BREAKOUT_ROOMS: Raise hand state = ${status}`);
      if (status === "VIDYO_PARTICIPANTHANDSTATE_DISMISSED") {
        store.dispatch(breakoutActions.setIsRaiseHandButtonActive(false));
      }
    });
    yield put(breakoutActions.setIsRaiseHandRequestInProgress(false));
    yield put({
      type: breakoutTypes.RAISE_HAND_SUCCEEDED,
    });
  } catch (e) {
    yield put(breakoutActions.setIsRaiseHandRequestInProgress(false));
    yield put(breakoutActions.setIsRaiseHandButtonActive(false));
    yield put({
      type: breakoutTypes.RAISE_HAND_FAILED,
      message: e?.message,
    });
  }
}

function* unraiseHand() {
  try {
    yield put(breakoutActions.setIsRaiseHandRequestInProgress(true));
    yield call(BreakoutRoomsProvider.unraiseHand);
    yield put(breakoutActions.setIsRaiseHandRequestInProgress(false));
    yield put(breakoutActions.setIsRaiseHandButtonActive(false));
    yield put({
      type: breakoutTypes.UNRAISE_HAND_SUCCEEDED,
    });
  } catch (e) {
    yield put(breakoutActions.setIsRaiseHandRequestInProgress(false));
    yield put({
      type: breakoutTypes.UNRAISE_HAND_FAILED,
      message: e?.message,
    });
  }
}

function* handleUserStatusUpdate(action) {
  try {
    const isApproved = action.payload?.handApproved;

    if (!isApproved) {
      yield put(breakoutActions.setIsRaiseHandButtonActive(false));
    }
  } catch (e) {
    yield console.error(
      "BREAKOUT_ROOMS: Error while handleUserStatusUpdate: ",
      e
    );
  }
}

function* actionWatcher() {
  yield takeLatest(breakoutTypes.TRANSFER_STARTED, handleTransferStarted);
  yield takeLatest(breakoutTypes.TRANSFER_FINISHED, handleTransferFinished);
  yield takeLatest(breakoutTypes.TRANSFER_FAILED, handleTransferFailed);
  yield takeLatest(callActionTypes.END_CALL_SUCCEEDED, handleCallEnded);
  yield takeLatest(breakoutTypes.RAISE_HAND, raiseHand);
  yield takeLatest(breakoutTypes.UNRAISE_HAND, unraiseHand);
  yield takeLatest(
    userActionTypes.MODERATION_STATUS_UPDATE,
    handleUserStatusUpdate
  );
}

export default actionWatcher;
