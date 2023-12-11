import {
  SET_IS_RAISE_HAND_BUTTTON_ACTIVE,
  SET_IS_RAISE_HAND_REQUEST_IN_PROGRESS,
  SET_IS_ROOM_BREAKOUT,
  SET_IS_SHOW_AFTER_MOOVING_NOTIFICATION,
  SET_IS_SHOW_LEFT_DIALOG,
  SET_MAIN_ROOM_ID,
  SET_MAIN_ROOM_NAME,
  SET_TRANSFER_STATUS,
} from "./actions/types";

const initialState = {
  isTransferInProgress: false,
  isRoomBreakout: false,
  mainConferenceName: "",
  mainConferenceId: "",
  isShowAfterMovingNotification: false,
  isShowLeftDialog: false,
  raiseHandRequestInProgres: false,
  raiseHandButtonActive: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_TRANSFER_STATUS:
      return {
        ...state,
        isTransferInProgress: action.payload,
      };

    case SET_IS_ROOM_BREAKOUT:
      return {
        ...state,
        isRoomBreakout: action.payload,
      };

    case SET_MAIN_ROOM_NAME:
      return {
        ...state,
        mainConferenceName: action.payload,
      };

    case SET_MAIN_ROOM_ID:
      return {
        ...state,
        mainConferenceId: action.payload,
      };

    case SET_IS_SHOW_AFTER_MOOVING_NOTIFICATION:
      return {
        ...state,
        isShowAfterMovingNotification: action.payload,
      };

    case SET_IS_SHOW_LEFT_DIALOG:
      return {
        ...state,
        isShowLeftDialog: action.payload,
      };

    case SET_IS_RAISE_HAND_REQUEST_IN_PROGRESS:
      return {
        ...state,
        raiseHandRequestInProgres: action.payload,
      };

    case SET_IS_RAISE_HAND_BUTTTON_ACTIVE:
      return {
        ...state,
        raiseHandButtonActive: action.payload,
      };

    default:
      return state;
  }
};
