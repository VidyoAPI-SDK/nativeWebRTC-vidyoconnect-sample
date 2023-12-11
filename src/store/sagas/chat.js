import { eventChannel } from "redux-saga";
import { put, call, takeLatest } from "redux-saga/effects";
import { getChatAPIProvider } from "services/ChatAPIProvider";
import { encodeHTMLString } from "utils/helpers";
import * as chatActionTypes from "../actions/types/chat";
import * as callActionTypes from "../actions/types/call";
import * as actionTypes from "../actions/types/chat";
import * as googleAnalyticsActions from "../actions/googleAnalytics";
import hunterChat from "utils/hunterChat";

const chatProvider = getChatAPIProvider();

function* sendChatMessage(action) {
  try {
    const message = yield chatProvider.sendChatMessage(action.payload);

    message.body = encodeHTMLString(message.body);

    // checks if it is "Special" message and doesn't add it to history
    if (hunterChat.isSpecialMessage(message.body)) {
      console.log(
        "HunterChat: message - the sent special message is ignored in chat"
      );
      return;
    }

    yield put({
      type: actionTypes.CHAT_MESSAGE_SEND_SUCCEEDED,
      payload: {
        isSent: true,
        message,
      },
    });
    yield put(googleAnalyticsActions.callChat("sendPublicChat"));
  } catch (e) {
    yield put({
      type: actionTypes.CHAT_MESSAGE_SEND_FAILED,
      message: e?.message,
    });
  }
}

function* addMessageClass(action) {
  try {
    const res = yield chatProvider.addMessageClass(action.payload);

    if (res) {
      yield put({
        type: actionTypes.CHAT_ADD_MESSAGE_CLASS_SUCCEEDED,
      });
    } else {
      yield put({
        type: actionTypes.CHAT_ADD_MESSAGE_CLASS_FAILED,
      });
    }
  } catch (e) {
    yield put({
      type: actionTypes.CHAT_ADD_MESSAGE_CLASS_FAILED,
      message: e?.message,
    });
  }
}

function* joinChat(action) {
  try {
    const chatChannel = yield call(createChatChannel, action);
    yield takeLatest(chatChannel, handleChatMessages);

    yield put({
      type: actionTypes.CHAT_JOIN_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.CHAT_JOIN_FAILED,
      message: e?.message,
    });
  }
}

function createChatChannel(action) {
  return eventChannel((emit) => {
    chatProvider.joinChat().then(() => {
      chatProvider.subscribeOnChatMessages(
        null,
        null,
        (participant, message) => {
          setTimeout(() => {
            emit({ participant, message });
          });
        }
      );
    });

    return () => {
      chatProvider.leaveChat();
    };
  });
}

function* handleChatMessages(payload) {
  if (payload.message.type === "VIDYO_CHATMESSAGETYPE_PrivateChat") {
    return;
  }
  // checks if it is "Special" message and doesn't add it to history
  if (hunterChat.isSpecialMessage(payload?.message?.body)) {
    yield put({
      type: actionTypes.CHAT_SPECIAL_MESSAGE_RECIEVED,
      payload,
    });
    console.log(
      "HunterChat: message - the received special message is ignored in chat"
    );
    return;
  }

  yield put({
    type: actionTypes.CHAT_MESSAGE_RECIEVED,
    payload,
  });
  yield put(googleAnalyticsActions.callChat("receivedPublicChat"));
}

function* leaveChat(action) {
  try {
    yield chatProvider.leaveChat();

    yield put({
      type: actionTypes.CHAT_LEAVE_SUCCEEDED,
    });
  } catch (e) {
    yield put({
      type: actionTypes.CHAT_LEAVE_FAILED,
      message: e?.message,
    });
  }
}

function* actionWatcher() {
  yield takeLatest(actionTypes.CHAT_MESSAGE_SEND, sendChatMessage);
  yield takeLatest(callActionTypes.START_CALL_SUCCEEDED, joinChat);
  yield takeLatest(callActionTypes.END_CALL_SUCCEEDED, leaveChat);
  yield takeLatest(chatActionTypes.CHAT_UNSUBSCRIBE, leaveChat);
  yield takeLatest(actionTypes.CHAT_ADD_MESSAGE_CLASS, addMessageClass);
}

export default actionWatcher;
