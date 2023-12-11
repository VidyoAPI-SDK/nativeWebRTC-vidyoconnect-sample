import { SET_SHARE_SYSTEM_PERMISSION_ERROR } from "./actions/types";

const initialState = {
  isShareSystemPermissionError: false,
  shareErrorType: "",
};

const globalMessages = (state = initialState, action) => {
  switch (action.type) {
    case SET_SHARE_SYSTEM_PERMISSION_ERROR:
      return {
        ...state,
        isShareSystemPermissionError: action.payload.value,
        shareErrorType: action.payload.shareErrorType,
      };

    default:
      return state;
  }
};

export default globalMessages;
