import {
  INIT,
  UNINIT,
  INIT_SUCCEEDED,
  INIT_FAILED,
  GENERATE_LOGS,
  GENERATE_LOGS_SUCCEEDED,
  GENERATE_LOGS_FAILED,
  DIACTIVATE_TAB,
  RECONNECTED_SUCCEEDED,
  CALL_RECONNECTING,
  CONFERENCE_LOST,
  UPDATE_NETWORK_CONNECTION_STATUS,
} from "../actions/types/app";

const initialState = {
  inited: false,
  initError: false,
  tabIsDisabled: false,
  generatingLogsInProgress: false,
  reconnected: { lastReconnection: null },
  networkConnectionStatus: true,
  callReconnecting : false
};

const app = (state = initialState, action) => {
  switch (action.type) {
    case INIT:
      return {
        ...state,
        inited: false,
      };

    case UNINIT:
      return {
        ...state,
        inited: false,
      };

    case INIT_SUCCEEDED:
      return {
        ...state,
        inited: true,
      };

    case INIT_FAILED:
      return {
        ...state,
        inited: false,
        initError: true,
      };

    case GENERATE_LOGS:
      return {
        ...state,
        generatingLogsInProgress: true,
      };

    case GENERATE_LOGS_SUCCEEDED:
      return {
        ...state,
        generatingLogsInProgress: false,
      };

    case GENERATE_LOGS_FAILED:
      return {
        ...state,
        generatingLogsInProgress: false,
      };
    case DIACTIVATE_TAB:
      return {
        ...state,
        tabIsDisabled: true,
      };
    case RECONNECTED_SUCCEEDED:
      return {
        ...state,
        reconnected: { lastReconnection: Date.now() },
        callReconnecting : false 
      };
    case CALL_RECONNECTING:
        return {
          ...state,
          callReconnecting : true
      };
    case CONFERENCE_LOST:
      return {
        ...state,
        callReconnecting: false
      };
    case UPDATE_NETWORK_CONNECTION_STATUS:
      return {
        ...state,
        networkConnectionStatus: action.payload,
      };
    default:
      return state;
  }
};

export default app;
