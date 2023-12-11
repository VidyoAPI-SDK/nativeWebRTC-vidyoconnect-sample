import {
  AUDIO_ONLY_MODE_CHANGED,
  AUTO_RECONNECT_CHANGED,
  CONNECTOR_API_LOGGING_CHANGED,
  COMPOSITOR_FIXED_PARTICIPANTS_CHANGED,
  MAX_RECONNECT_ATTEMPTS_CHANGED,
  PARTICIPANT_LIMIT_CHANGED,
  RECONNECT_BACKOFF_CHANGED,
  SHOW_STATS_OVERLAY_CHANGED,
  SIMPLE_API_LOGGING_CHANGED,
  SCREENSHARE_SIMULCAST_CHANGED,
  STATS_DISABLED,
  VIDEO_SIMULCAST_CHANGED,
  LOG_LEVELS_CHANGED,
  LOG_CATEGORIES_CHANGED,
  ACTIVE_LOGS_CHANGED,
} from "./actions/types";

const initialState = {
  statsServerUrl: window.appConfig.REACT_APP_LOKI_SERVER_DEFAULT_URL,
  isAudioOnlyModeEnabled: false,
  isAutoReconnectEnabled: false,
  isCompositorFixedParticipantsEnabled: false,
  isConnectorApiLoggingEnabled: false,
  isScreenShareSimulcastEnabled: false,
  isSimpeApiLoggingEnabled: false,
  isStatsDisabled: false,
  isStatsOverlayDisplayed: false,
  isVideoSimulcastEnabled: false,
  maxReconnectAttempts: 0,
  participantLimit: 8,
  reconnectBackoff: 0,
  logCategories: [],
  logLevels: {},
  activeLogs: {},
};

const advancedConfig = (state = initialState, action) => {
  switch (action.type) {
    case STATS_DISABLED:
      return {
        ...state,
        isStatsDisabled: action.disabled,
      };

    case AUDIO_ONLY_MODE_CHANGED:
      return {
        ...state,
        isAudioOnlyModeEnabled: action.enabled,
      };

    case AUTO_RECONNECT_CHANGED:
      return {
        ...state,
        isAutoReconnectEnabled: action.enabled,
      };

    case COMPOSITOR_FIXED_PARTICIPANTS_CHANGED:
      return {
        ...state,
        isCompositorFixedParticipantsEnabled: action.enabled,
      };

    case CONNECTOR_API_LOGGING_CHANGED:
      return {
        ...state,
        isConnectorApiLoggingEnabled: action.enabled,
      };

    case SIMPLE_API_LOGGING_CHANGED:
      return {
        ...state,
        isSimpeApiLoggingEnabled: action.enabled,
      };

    case VIDEO_SIMULCAST_CHANGED:
      return {
        ...state,
        isVideoSimulcastEnabled: action.enabled,
      };

    case SCREENSHARE_SIMULCAST_CHANGED:
      return {
        ...state,
        isScreenShareSimulcastEnabled: action.enabled,
      };

    case MAX_RECONNECT_ATTEMPTS_CHANGED:
      return {
        ...state,
        maxReconnectAttempts: action.maxAttempts,
      };

    case PARTICIPANT_LIMIT_CHANGED:
      return {
        ...state,
        participantLimit: action.limit,
      };

    case RECONNECT_BACKOFF_CHANGED:
      return {
        ...state,
        reconnectBackoff: action.backoff,
      };

    case SHOW_STATS_OVERLAY_CHANGED:
      return {
        ...state,
        isStatsOverlayDisplayed: action.displayed,
      };

    case LOG_LEVELS_CHANGED:
      return {
        ...state,
        logLevels: { ...action.logLevels },
      };

    case LOG_CATEGORIES_CHANGED:
      return {
        ...state,
        logCategories: [...action.logCategories],
      };

    case ACTIVE_LOGS_CHANGED:
      return {
        ...state,
        activeLogs: { ...action.activeLogs },
      };

    default:
      return state;
  }
};

export default advancedConfig;
