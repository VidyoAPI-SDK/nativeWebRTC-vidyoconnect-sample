import {
  UPDATE_USER,
  SET_USER_SUCCEEDED,
  RESET_USER,
} from "../actions/types/user";

const initialState = {
  name: "",
  displayName: "",
  cameraMuted: true,
  microphoneMuted: true,
  isGuest: true,
  isRegistered: false,
  userInfo: null,
  userPortal: null,
  userAuthToken: null,
  userLoginSource: null,
  accountType: "",
  becomeModerator: false,
};

const user = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_USER:
      return {
        ...state,
        ...action.data,
        userInfo: {
          ...state.userInfo,
          ...(action.data?.userInfo || {}),
        },
      };
    case SET_USER_SUCCEEDED:
      return {
        ...state,
        isGuest: false,
        isRegistered: true,
        userInfo: action.payload.entity,
        userPortal: action.payload.portal,
        userAuthToken: action.payload.authToken,
        userLoginSource: action.payload.source,
        accountType: action.payload.accountType,
      };
    case RESET_USER:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default user;
