import { SET_FULLSCREEN_CHANGED } from "./actions/types";

const initialState = {
  isEnabled: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_FULLSCREEN_CHANGED:
      return {
        ...state,
        isEnabled: action.isEnabled,
      };

    default:
      return state;
  }
};
