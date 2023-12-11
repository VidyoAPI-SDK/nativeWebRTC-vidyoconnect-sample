import {
  CHAT_MESSAGE_SEND,
  CHAT_MESSAGES_SUBSCRIBE,
  CHAT_MESSAGES_UNSUBSCRIBE,
  CHAT_ADD_MESSAGE_CLASS,
  CHAT_UNSUBSCRIBE,
  UPDATE_READ_MESSAGE_COUNT,
  SET_UNREAD_MESSAGE_COUNT,
} from "./types/chat";

export const sendChatMessage = (payload) => ({
  type: CHAT_MESSAGE_SEND,
  payload,
});

export const subscribeOnChatMessages = () => ({
  type: CHAT_MESSAGES_SUBSCRIBE,
});

export const unsubscribeFromChatMessages = () => ({
  type: CHAT_MESSAGES_UNSUBSCRIBE,
});

/**
 * @param {String} payload ex: MSGCLASS_HUNTER
 */
export const addMessageClass = (payload) => ({
  type: CHAT_ADD_MESSAGE_CLASS,
  payload,
});

export const closeChatChanel = () => ({
  type: CHAT_UNSUBSCRIBE,
});

export const updateReadMessageCount = (payload) => ({
  type: UPDATE_READ_MESSAGE_COUNT,
  payload,
});

export const setUnreadMessageCount = (payload) => ({
  type: SET_UNREAD_MESSAGE_COUNT,
  payload,
});
