import {
  START_CALL,
  START_CALL_SUCCEEDED,
  START_CALL_FAILED,
  END_CALL,
  END_CALL_SUCCEEDED,
  END_CALL_FAILED,
  UPDATE_PARTICIPANTS,
  LOCAL_WINDOW_SHARES_UPDATE,
  REMOTE_WINDOW_SHARES_UPDATE,
  REJOIN_CALL,
  GET_CALL_PROPERTIES,
  GET_CALL_PROPERTIES_SUCCEEDED,
  UPDATE_RECORDER_STATUS,
  UPDATE_AVAILIBLE_RESOURCES,
  PIN_PARTICIPANT_FAILED,
  UNPIN_PARTICIPANT_FAILED,
  PIN_PARTICIPANT_SUCCEEDED,
  UNPIN_PARTICIPANT_SUCCEEDED,
  SET_ROOM_INFO,
  RESET_ROOM_INFO,
  LOCK_ROOM,
  UNLOCK_ROOM,
  OPEN_MODERATION_PANEL,
  CLOSE_MODERATION_PANEL,
  SAVE_ROOM_PIN,
  SAVE_PARTICIPANTS_DETAILS,
  COMPOSITOR_UPDATED,
  COMPOSITOR_UPDATES_SUBSCRIBE,
  COMPOSITOR_UPDATES_UNSUBSCRIBE,
  COMPOSITOR_VIEW_TYPE_CHANGED,
  FECC_STATE_TOGGLE,
} from "../actions/types/call";

const initialState = {
  active: false,
  joining: false,
  leaving: false,
  properties: {},
  participants: {
    list: [],
    participantJoined: null,
    participantLeft: null,
    pinned: null,
    detailedList: [],
  },
  callStartedTime: 0,
  compositorTiles: [],
  compositorViewType: null,
  recorderOn: false,
  availibleResources: null,
  remoteWindowShares: [],
  localWindowShares: [],
  selectedShare: null,
  disconnectReason: null,
  moderationPanelOpened: false,
  feccOpen: false,
  roomInfo: {},
};

const call = (state = initialState, action) => {
  switch (action.type) {
    case START_CALL:
      return {
        ...state,
        joining: true,
        disconnectReason: null,
      };

    case START_CALL_SUCCEEDED:
      return {
        ...state,
        joining: false,
        active: true,
        callStartedTime: action.callStartedTime || 0,
      };

    case START_CALL_FAILED:
      return {
        ...state,
        joining: false,
        disconnectReason: action.reason || null,
      };

    case GET_CALL_PROPERTIES:
      return {
        ...state,
        properties: {},
      };

    case GET_CALL_PROPERTIES_SUCCEEDED:
      return {
        ...state,
        properties: action.properties || {},
      };

    case END_CALL:
      return {
        ...state,
        leaving: true,
        properties: {},
      };

    case END_CALL_SUCCEEDED:
    case END_CALL_FAILED:
      return {
        ...state,
        disconnectReason: action.reason || null,
        joining: false,
        leaving: false,
        active: false,
      };

    case UPDATE_PARTICIPANTS:
      return {
        ...state,
        participants: {
          list: [...action.participants.list].sort((item1, item2) =>
            item1.name.localeCompare(item2.name)
          ),
          participantLeft: action.participants.participantLeft,
          participantJoined: action.participants.participantJoined,
          pinned: state.participants.pinned,
          detailedList: state.participants.detailedList,
        },
      };

    case SAVE_PARTICIPANTS_DETAILS:
      return {
        ...state,
        participants: {
          ...state.participants,
          detailedList: action.payload,
        },
      };

    case LOCAL_WINDOW_SHARES_UPDATE:
      return {
        ...state,
        localWindowShares: [...action.localWindowShares],
        selectedShare: action.localWindowShares.find((s) => s.selected) || null,
      };

    case REMOTE_WINDOW_SHARES_UPDATE:
      return {
        ...state,
        remoteWindowShares: [...action.remoteWindowShares],
      };

    case UPDATE_RECORDER_STATUS:
      return {
        ...state,
        recorderOn: action.recorderStatus,
      };

    case UPDATE_AVAILIBLE_RESOURCES:
      return {
        ...state,
        availibleResources: action.availibleResources,
      };

    case REJOIN_CALL:
      return {
        ...initialState,
      };

    case PIN_PARTICIPANT_SUCCEEDED:
      return {
        ...state,
        participants: {
          list: state.participants.list,
          participantLeft: state.participants.participantLeft,
          participantJoined: state.participants.participantJoined,
          pinned: action.payload.participant,
          detailedList: state.participants.detailedList,
        },
      };

    case PIN_PARTICIPANT_FAILED:
    case UNPIN_PARTICIPANT_FAILED:
      return {
        ...state,
      };

    case UNPIN_PARTICIPANT_SUCCEEDED:
      return {
        ...state,
        participants: {
          list: state.participants.list,
          participantLeft: state.participants.participantLeft,
          participantJoined: state.participants.participantJoined,
          pinned: null,
          detailedList: state.participants.detailedList,
        },
      };

    case OPEN_MODERATION_PANEL:
      return {
        ...state,
        moderationPanelOpened: true,
      };

    case CLOSE_MODERATION_PANEL:
      return {
        ...state,
        moderationPanelOpened: false,
      };

    case SET_ROOM_INFO:
      return {
        ...state,
        roomInfo: action.payload,
      };

    case RESET_ROOM_INFO:
      return {
        ...state,
        roomInfo: null,
      };

    case LOCK_ROOM:
      return {
        ...state,
        roomInfo: {
          ...state.roomInfo,
          RoomMode: {
            ...state.roomInfo?.RoomMode,
            isLocked: true,
          },
        },
      };
    case UNLOCK_ROOM:
      return {
        ...state,
        roomInfo: {
          ...state.roomInfo,
          RoomMode: {
            ...state.roomInfo?.RoomMode,
            isLocked: false,
          },
        },
      };

    case SAVE_ROOM_PIN:
      return {
        ...state,
        roomInfo: {
          ...state?.roomInfo,
          RoomMode: {
            ...state.roomInfo?.RoomMode,
            roomPIN: action.payload,
          },
        },
      };

    case COMPOSITOR_UPDATED:
      return {
        ...state,
        compositorTiles: [...action.compositorTiles],
      };

    case COMPOSITOR_VIEW_TYPE_CHANGED:
      return {
        ...state,
        compositorViewType: action.payload,
      };

    case COMPOSITOR_UPDATES_SUBSCRIBE:
    case COMPOSITOR_UPDATES_UNSUBSCRIBE:
      return {
        ...state,
        compositorTiles: [],
      };

    case FECC_STATE_TOGGLE:
      return {
        ...state,
        feccOpen: action.payload,
      };

    default:
      return state;
  }
};

export default call;
