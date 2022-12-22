import {
  SET_EXT_DATA,
  SET_EXT_DATA_SUCCEEDED,
  SET_EXT_DATA_FAILED,
  SET_STATISTICS_OVERLAY_SUCCEEDED,
  SET_URL_PARAMS,
  SET_PORTAL_FEATURES,
  SET_COMPOSITOR_FIXED_PARTICIPANTS,
  SET_COMPOSITOR_FIXED_PARTICIPANTS_FAILED,
  GET_CUSTOM_PARAMETERS_SUCCEEDED,
  GET_CUSTOM_PARAMETERS_FAILED,
  GET_GCP_SERVICES_LIST_SUCCEEDED,
  GET_GCP_SERVICES_LIST_FAILED,
  RESET_GCP_SERVICES_LIST,
  GET_ENDPOINT_BEHAVIOUR_SUCCEEDED,
  GET_ENDPOINT_BEHAVIOUR_FAILED,
  SEND_SMS,
  SET_JWT_TOKEN,
  SET_REFRESH_TOKEN,
  EPIC_CALL_SESSION_INITIALIZED,
  EPIC_CALL_SESSION_STARTED,
  EPIC_CALL_SET_DOCUMENT_TYPES,
  EPIC_CALL_RESET_SESSION,
} from "../actions/types/config";

const initialState = {
  extData: "",
  extDataType: "",
  hasExtData: false,
  extDataFlag: false,
  isStatisticsOverlaySet: false,
  enableCompositorFixedParticipants: false,
  urlPin: {
    value: "",
    isDefault: true,
  },
  urlPortal: {
    value: "",
    isDefault: true,
  },
  urlRoomKey: {
    value: "",
    isDefault: true,
  },
  urlDisplayName: {
    value: "",
    isDefault: true,
  },
  urlDoNotSaveDisplayName: {
    value: false,
    isDefault: true,
  },
  urlExtData: {
    value: "",
    isDefault: true,
  },
  urlExtDataType: {
    value: "",
    isDefault: true,
  },
  urlWelcomePage: {
    value: true,
    isDefault: true,
  },
  urlBeautyScreen: {
    value: true,
    isDefault: true,
  },
  urlDebug: {
    value: false,
    isDefault: true,
  },
  urlSkipPermissionsCheck: {
    value: false,
    isDefault: true,
  },
  urlMuteCameraOnJoin: {
    value: false,
    isDefault: true,
  },
  urlMuteMicrophoneOnJoin: {
    value: false,
    isDefault: true,
  },
  urlCameraMuteControl: {
    value: true,
    isDefault: true,
  },
  urlMicrophoneMuteControl: {
    value: true,
    isDefault: true,
  },
  urlShare: {
    value: true,
    isDefault: true,
  },
  urlLeftPanel: {
    value: true,
    isDefault: true,
  },
  urlChat: {
    value: true,
    isDefault: true,
  },
  urlWaitingRoomVideoContent: {
    value: "",
    isDefault: true,
  },
  urlWaitingRoomAudioContent: {
    value: "",
    isDefault: true,
  },
  urlWaitingRoomBackgroundContent: {
    value: "",
    isDefault: true,
  },
  urlEpicCallLaunchToken: {
    value: "",
    isDefault: true,
  },
  urlStatsServer: {
    value: "",
    isDefault: true,
  },
  urlModeratorPin: {
    value: "",
    isDefault: true,
  },
  urlHWT: {
    value: "",
    isDefault: true,
  },
  urlHWTStrictMode: {
    value: "",
    isDefault: true,
  },
  urlAccessCode: {
    value: false,
    isDefault: true,
  },
  urlSessionToken: {
    value: "",
    isDefault: true,
  },
  customParameters: {},
  listOfGCPServices: {},
  endpointBehaviour: {},
  jwtToken: "",
  refreshToken: "",
  epicCallSessionInitialized: false,
  epicCallSessionStarted: false,
  epicCallDocumentTypes: null,
  urlMuteSpeakerOnJoinToggle: {
    value: false,
    isDefault: false,
  },
  urlShowAudioMuteControl: {
    value: true,
    isDefault: true,
  },
  urlInitializeWebView: {
    value: false,
    isDefault: false,
  },
};

const config = (state = initialState, action) => {
  switch (action.type) {
    case SET_EXT_DATA:
      return {
        ...state,
        extData: action.payload.extData,
        extDataType: action.payload.extDataType,
      };

    case SET_COMPOSITOR_FIXED_PARTICIPANTS:
      return {
        ...state,
        ...action.payload,
      };

    case SET_COMPOSITOR_FIXED_PARTICIPANTS_FAILED:
      return {
        ...state,
      };

    case SET_EXT_DATA_SUCCEEDED:
      return {
        ...state,
        hasExtData: !!(state.extData && state.extDataType === "1"),
      };

    case SET_EXT_DATA_FAILED:
      return {
        ...state,
        extData: "",
        extDataType: "",
        hasExtData: false,
      };

    case SET_STATISTICS_OVERLAY_SUCCEEDED:
      return {
        ...state,
        isStatisticsOverlaySet: action.show,
      };

    case SET_URL_PARAMS:
      return {
        ...state,
        ...action.payload,
      };

    case SEND_SMS:
      return {
        ...state,
        ...action.payload,
      };

    case SET_PORTAL_FEATURES:
      return {
        ...state,
        portalFeatures: action.payload,
      };

    case GET_CUSTOM_PARAMETERS_SUCCEEDED:
      return {
        ...state,
        customParameters: action.payload,
      };

    case GET_CUSTOM_PARAMETERS_FAILED:
      return {
        ...state,
        customParameters: {},
      };

    case GET_GCP_SERVICES_LIST_SUCCEEDED:
      return {
        ...state,
        listOfGCPServices: action.payload,
      };

    case GET_GCP_SERVICES_LIST_FAILED:
    case RESET_GCP_SERVICES_LIST:
      return {
        ...state,
        listOfGCPServices: {},
      };

    case GET_ENDPOINT_BEHAVIOUR_SUCCEEDED:
      return {
        ...state,
        endpointBehaviour: action.payload,
      };

    case GET_ENDPOINT_BEHAVIOUR_FAILED:
      return {
        ...state,
        endpointBehaviour: {},
      };

    case SET_JWT_TOKEN:
      return {
        ...state,
        jwtToken: action.payload,
      };

    case SET_REFRESH_TOKEN:
      return {
        ...state,
        refreshToken: action.payload,
      };

    case EPIC_CALL_SESSION_INITIALIZED:
      return {
        ...state,
        epicCallSessionInitialized: action.payload,
      };

    case EPIC_CALL_SESSION_STARTED:
      return {
        ...state,
        epicCallSessionStarted: action.payload,
      };

    case EPIC_CALL_SET_DOCUMENT_TYPES:
      return {
        ...state,
        epicCallDocumentTypes: action.payload,
      };

    case EPIC_CALL_RESET_SESSION:
      return {
        ...state,
        epicCallSessionInitialized: false,
        epicCallSessionStarted: false,
        epicCallDocumentTypes: null,
      };

    default:
      return state;
  }
};

export default config;
