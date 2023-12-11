import {
  SET_GOOGLE_ANALYTICS_WEB_PROPERTY_ID,
  GET_ANALYTICS_EVENT_TABLE,
  CONTROL_ANALYTICS_EVENT_ACTION,
  START_ANALYTICS,
  STOP_ANALYTICS,
} from "./types";

export const setGoogleAnalyticsWebPropertyId = (webPropertyId) => ({
  type: SET_GOOGLE_ANALYTICS_WEB_PROPERTY_ID,
  webPropertyId,
});

export const getAnalyticsEventTable = () => ({
  type: GET_ANALYTICS_EVENT_TABLE,
});

export const controlAnalyticsEventTable = ({
  eventCategory,
  eventAction,
  enable,
}) => ({
  type: CONTROL_ANALYTICS_EVENT_ACTION,
  payload: {
    eventCategory,
    eventAction,
    enable,
  },
});

export const startAnalytics = ({ serviceType, trackingID }) => ({
  type: START_ANALYTICS,
  payload: {
    serviceType,
    trackingID,
  },
});

export const stopAnalytics = () => ({
  type: STOP_ANALYTICS,
});
