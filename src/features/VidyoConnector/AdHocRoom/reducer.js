import {
  CREATE_ADHOC_ROOM,
  CREATE_ADHOC_ROOM_SUCCEEDED,
  CREATE_ADHOC_ROOM_FAILED,
} from "./actions/types";

const initialState = {
  error: null,
  isCreated: false,
  isLoading: false,
  inviteContent: null,
  portal: null,
  roomKey: null,
  roomUrl: null,
  pin: null,
};

function createRoomReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_ADHOC_ROOM:
      return {
        ...initialState,
        isCreated: false,
        isLoading: true,
      };
    case CREATE_ADHOC_ROOM_SUCCEEDED:
      return {
        ...state,
        portal: action.payload.portal,
        roomKey: action.payload.roomKey,
        roomUrl: action.payload.roomUrl,
        inviteContent: action.payload.inviteContent,
        pin: action.payload.pin,
        isCreated: true,
        isLoading: false,
      };
    case CREATE_ADHOC_ROOM_FAILED:
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };
    default:
      return state;
  }
}

export default createRoomReducer;
