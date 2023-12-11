import {
  CHAT_LEAVE_SUCCEEDED,
  CHAT_MESSAGE_RECIEVED,
  CHAT_MESSAGE_SEND_SUCCEEDED,
  CHAT_SPECIAL_MESSAGE_RECIEVED,
  UPDATE_READ_MESSAGE_COUNT,
  SET_UNREAD_MESSAGE_COUNT,
} from "../actions/types/chat";

const initialState = {
  history: [],
  specialMessage: null,
  readMessageCount: 0,
  unreadMessageCount: 0,
};

const chat = (state = initialState, action) => {
  switch (action.type) {
    case CHAT_MESSAGE_SEND_SUCCEEDED:
      return {
        ...state,
        history: [...state.history, action.payload],
      };

    case CHAT_MESSAGE_RECIEVED:
      return {
        ...state,
        history: [...state.history, action.payload],
      };

    case CHAT_LEAVE_SUCCEEDED:
      return {
        ...state,
        history: [],
      };

    case CHAT_SPECIAL_MESSAGE_RECIEVED:
      return {
        ...state,
        specialMessage: action.payload,
      };

    case UPDATE_READ_MESSAGE_COUNT:
      return {
        ...state,
        readMessageCount: action.payload,
      };

    case SET_UNREAD_MESSAGE_COUNT:
      return {
        ...state,
        unreadMessageCount: action.payload,
      };
    default:
      return state;
  }
};

export default chat;
