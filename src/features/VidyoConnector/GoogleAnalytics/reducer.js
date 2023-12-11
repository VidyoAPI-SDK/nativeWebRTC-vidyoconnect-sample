import {
  ENABLE_GOOGLE_ANALYTICS,
  SET_GOOGLE_ANALYTICS_WEB_PROPERTY_ID,
  CONTROL_ANALYTICS_EVENT_ACTION_SUCCEEDED,
  GET_ANALYTICS_EVENT_TABLE_SUCCEEDED,
  START_ANALYTICS_SUCCEEDED,
  STOP_ANALYTICS_SUCCEEDED,
} from "./actions/types";

const initialState = {
  eventTable: {},
  isGaEnabled: false,
  isGaStarted: false,
  gaWebPropertyId: null,
};

const analytics = (state = initialState, action) => {
  switch (action.type) {
    case ENABLE_GOOGLE_ANALYTICS:
      return {
        ...state,
        isGaEnabled: true,
      };

    case CONTROL_ANALYTICS_EVENT_ACTION_SUCCEEDED:
      return {
        ...state,
        eventTable: {
          ...state.eventTable,
          [action.payload.eventCategory]: {
            ...state.eventTable[action.payload.eventCategory],
            [action.payload.eventAction]: action.payload.enable,
          },
        },
      };

    case GET_ANALYTICS_EVENT_TABLE_SUCCEEDED:
      return {
        ...state,
        eventTable: { ...action.eventTable },
      };

    case SET_GOOGLE_ANALYTICS_WEB_PROPERTY_ID:
      return {
        ...state,
        gaWebPropertyId: action.webPropertyId,
      };

    case START_ANALYTICS_SUCCEEDED:
      return {
        ...state,
        isGaStarted: action.result,
      };

    case STOP_ANALYTICS_SUCCEEDED:
      return {
        ...state,
        isGaStarted: false,
      };

    default:
      return state;
  }
};

export default analytics;
