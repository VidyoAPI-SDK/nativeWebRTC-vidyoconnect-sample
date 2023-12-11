import {
  SET_EXT_DATA,
  SET_STATISTICS_OVERLAY,
  SET_URL_PARAMS,
  SET_PORTAL_FEATURES,
  SET_COMPOSITOR_FIXED_PARTICIPANTS,
  GET_CUSTOM_PARAMETERS,
  GET_GCP_SERVICES_LIST,
  RESET_GCP_SERVICES_LIST,
  GET_ENDPOINT_BEHAVIOUR,
  GET_ENDPOINT_BEHAVIOUR_SUCCEEDED,
  SEND_SMS,
  SET_JWT_TOKEN,
  GET_JWT_TOKEN,
  SET_REFRESH_TOKEN,
  SET_PARTICIPANT_LIMIT,
  SET_DISABLE_PARTICIPANT_RESTRICTIONS_TABLET,
  EPIC_CALL_SESSION_INITIALIZED,
  EPIC_CALL_SESSION_STARTED,
  EPIC_CALL_SET_DOCUMENT_TYPES,
  EPIC_CALL_RESET_SESSION,
  SET_GEOLOCATION_URL,
  SET_PRODUCT_INFO,
  SET_CAPTION_FONT_SIZE,
  SET_CAPTION_BACKGROUND,
  SET_P2P_CONNECTION,
  RESET_IN_CALL_INVOCATION_PARAMS,
} from "./types/config";

export const setExtData = (payload) => ({
  type: SET_EXT_DATA,
  payload,
});

export const setCompositorFixedParticipants = (payload) => ({
  type: SET_COMPOSITOR_FIXED_PARTICIPANTS,
  payload,
});

export const setStatisticsOverlay = (show) => ({
  type: SET_STATISTICS_OVERLAY,
  show,
});

export const setParticipantLimit = (limit) => ({
  type: SET_PARTICIPANT_LIMIT,
  limit,
});

export const setDisableTabletParticipantLimitRestrictions = (disable) => ({
  type: SET_DISABLE_PARTICIPANT_RESTRICTIONS_TABLET,
  disable,
});

export const setUrlParams = (url) => {
  const payload = {};

  const searchParams = new URLSearchParams(url);

  if (searchParams.has("portal")) {
    payload.urlPortal = { isDefault: false };
    payload.urlPortal.value = decodeURIComponent(
      searchParams.get("portal") || ""
    );
  }
  if (searchParams.has("roomKey")) {
    payload.urlRoomKey = { isDefault: false };
    payload.urlRoomKey.value = searchParams.get("roomKey") || "";
  }
  if (searchParams.has("displayName") || searchParams.has("dispName")) {
    payload.urlDisplayName = { isDefault: false };
    payload.urlDisplayName.value =
      searchParams.get("displayName") || searchParams.get("dispName") || "";
  }
  if (searchParams.has("doNotSaveDisplayName")) {
    payload.urlDoNotSaveDisplayName = { isDefault: false };
    payload.urlDoNotSaveDisplayName.value = transformToBoolean(
      searchParams.get("doNotSaveDisplayName")
    );
  }
  if (searchParams.has("roomPin")) {
    payload.urlPin = { isDefault: false };
    payload.urlPin.value = searchParams.get("roomPin") || "";
  }
  if (searchParams.has("extData")) {
    payload.urlExtData = { isDefault: false };
    payload.urlExtData.value = searchParams.get("extData") || "";
  }
  if (searchParams.has("extDataType")) {
    payload.urlExtDataType = { isDefault: false };
    payload.urlExtDataType.value = searchParams.get("extDataType") || "";
  }
  if (searchParams.has("debug")) {
    payload.urlDebug = { isDefault: false };
    payload.urlDebug.value = transformToBoolean(searchParams.get("debug"));
  }
  if (searchParams.has("skipPermissionsCheck")) {
    payload.urlSkipPermissionsCheck = { isDefault: false };
    payload.urlSkipPermissionsCheck.value = transformToBoolean(
      searchParams.get("skipPermissionsCheck")
    );
  }
  if (searchParams.has("welcomePage")) {
    payload.urlWelcomePage = { isDefault: false };
    payload.urlWelcomePage.value = transformToBoolean(
      searchParams.get("welcomePage")
    );
  }
  if (searchParams.has("beautyScreen")) {
    payload.urlBeautyScreen = { isDefault: false };
    payload.urlBeautyScreen.value = transformToBoolean(
      searchParams.get("beautyScreen")
    );
  }

  if (searchParams.has("loki")) {
    payload.urlLoki = { isDefault: false };
    payload.urlLoki.value = transformToBoolean(searchParams.get("loki"));
  }

  if (searchParams.has("muteCameraOnJoin")) {
    payload.urlMuteCameraOnJoin = { isDefault: false };
    payload.urlMuteCameraOnJoin.value = transformToBoolean(
      searchParams.get("muteCameraOnJoin")
    );
  }

  if (searchParams.has("muteMicOnJoin")) {
    payload.urlMuteMicrophoneOnJoin = { isDefault: false };
    payload.urlMuteMicrophoneOnJoin.value = transformToBoolean(
      searchParams.get("muteMicOnJoin")
    );
  }

  if (searchParams.has("camMuteCntrl")) {
    payload.urlCameraMuteControl = { isDefault: false };
    payload.urlCameraMuteControl.value = transformToBoolean(
      searchParams.get("camMuteCntrl")
    );
  }

  if (searchParams.has("micMuteCntrl")) {
    payload.urlMicrophoneMuteControl = { isDefault: false };
    payload.urlMicrophoneMuteControl.value = transformToBoolean(
      searchParams.get("micMuteCntrl")
    );
  }

  if (searchParams.has("share")) {
    payload.urlShare = { isDefault: false };
    payload.urlShare.value = transformToBoolean(searchParams.get("share"));
  }

  if (searchParams.has("leftPanel")) {
    payload.urlLeftPanel = { isDefault: false };
    payload.urlLeftPanel.value = transformToBoolean(
      searchParams.get("leftPanel")
    );
  }

  if (searchParams.has("chat")) {
    payload.urlChat = { isDefault: false };
    payload.urlChat.value = transformToBoolean(searchParams.get("chat"));
  }

  if (searchParams.has("wrvc")) {
    payload.urlWaitingRoomVideoContent = { isDefault: false };
    payload.urlWaitingRoomVideoContent.value = searchParams.get("wrvc");
  }

  if (searchParams.has("wrac")) {
    payload.urlWaitingRoomAudioContent = { isDefault: false };
    payload.urlWaitingRoomAudioContent.value = searchParams.get("wrac");
  }

  if (searchParams.has("wrbc")) {
    payload.urlWaitingRoomBackgroundContent = { isDefault: false };
    payload.urlWaitingRoomBackgroundContent.value = searchParams.get("wrbc");
  }

  if (searchParams.has("launchToken")) {
    payload.urlEpicCallLaunchToken = { isDefault: false };
    payload.urlEpicCallLaunchToken.value = searchParams.get("launchToken");
  }

  if (searchParams.has("statsServer")) {
    payload.urlStatsServer = { isDefault: false };
    payload.urlStatsServer.value = searchParams.get("statsServer") || "";
  }

  if (searchParams.has("moderatorPIN")) {
    payload.urlModeratorPin = { isDefault: false };
    payload.urlModeratorPin.value = searchParams.get("moderatorPIN") || "";
  }

  if (searchParams.has("hwt")) {
    payload.urlHWT = { isDefault: false };
    payload.urlHWT.value = transformToBoolean(searchParams.get("hwt"));
  }

  if (searchParams.has("hwtStrictMode")) {
    payload.urlHWTStrictMode = { isDefault: false };
    payload.urlHWTStrictMode.value = transformToBoolean(
      searchParams.get("hwtStrictMode")
    );
  }

  if (searchParams.has("skipParticipantNotifications")) {
    payload.urlSkipParticipantNotifications = { isDefault: false };
    payload.urlSkipParticipantNotifications.value = transformToBoolean(
      searchParams.get("skipParticipantNotifications")
    );
  }

  if (searchParams.has("pin")) {
    payload.urlAccessCode = { isDefault: false };
    payload.urlAccessCode.value = transformToBoolean(searchParams.get("pin"));
  }

  if (searchParams.has("sessionToken")) {
    payload.urlSessionToken = { isDefault: false };
    payload.urlSessionToken.value = searchParams.get("sessionToken");
  }

  if (searchParams.has("clientId")) {
    payload.urlEpicClientId = { isDefault: false };
    payload.urlEpicClientId.value = searchParams.get("clientId");
  }

  if (searchParams.has("initializeWebView")) {
    const value = transformToBoolean(searchParams.get("initializeWebView"));

    payload.urlInitializeWebView = { isDefault: false };
    payload.urlInitializeWebView.value = value;

    if (value) {
      payload.urlMuteMicrophoneOnJoin = { isDefault: false };
      payload.urlMuteMicrophoneOnJoin.value = true;

      payload.urlMuteCameraOnJoin = { isDefault: false };
      payload.urlMuteCameraOnJoin.value = true;

      payload.urlMicrophoneMuteControl = { isDefault: false };
      payload.urlMicrophoneMuteControl.value = false;

      payload.urlCameraMuteControl = { isDefault: false };
      payload.urlCameraMuteControl.value = false;

      payload.urlMuteSpeakerOnJoinToggle = { isDefault: false };
      payload.urlMuteSpeakerOnJoinToggle.value = true;

      payload.urlShowAudioMuteControl = { isDefault: false };
      payload.urlShowAudioMuteControl.value = false;
    }
  }

  if (searchParams.has("showAudioMuteControl")) {
    payload.urlShowAudioMuteControl = { isDefault: true };
    payload.urlShowAudioMuteControl.value = transformToBoolean(
      searchParams.get("showAudioMuteControl")
    );
  }

  return {
    type: SET_URL_PARAMS,
    payload,
  };
};

export const setPortalFeatures = (payload) => {
  return {
    type: SET_PORTAL_FEATURES,
    payload,
  };
};

export const getCustomParameters = (payload, callback = () => {}) => {
  return {
    type: GET_CUSTOM_PARAMETERS,
    payload,
    callback,
  };
};

export const sendSMS = (payload, callback) => {
  return {
    type: SEND_SMS,
    payload,
    callback,
  };
};

export const getGCPServicesList = (payload, callback = () => {}) => {
  return {
    type: GET_GCP_SERVICES_LIST,
    payload,
    callback,
  };
};

export const resetGCPServicesList = () => {
  return {
    type: RESET_GCP_SERVICES_LIST,
  };
};

export const getEndpointBehaviour = () => {
  return {
    type: GET_ENDPOINT_BEHAVIOUR,
  };
};

export const setEndpointBehaviour = (payload) => {
  return {
    type: GET_ENDPOINT_BEHAVIOUR_SUCCEEDED,
    payload,
  };
};

export const setJwtToken = (payload) => {
  return {
    type: SET_JWT_TOKEN,
    payload,
  };
};

export const getJwtToken = () => {
  return {
    type: GET_JWT_TOKEN,
  };
};

export const setRefreshToken = (payload) => {
  return {
    type: SET_REFRESH_TOKEN,
    payload,
  };
};

const transformToBoolean = (value) => {
  return ["true", "1"].includes(value);
};

export const setEpicCallSessionInitialized = (payload) => {
  return {
    type: EPIC_CALL_SESSION_INITIALIZED,
    payload,
  };
};

export const setEpicCallSessionStarted = (payload) => {
  return {
    type: EPIC_CALL_SESSION_STARTED,
    payload,
  };
};

export const setEpicCallDocumentTypes = (payload) => {
  return {
    type: EPIC_CALL_SET_DOCUMENT_TYPES,
    payload,
  };
};

export const epicCallResetSession = (payload) => {
  return {
    type: EPIC_CALL_RESET_SESSION,
    payload,
  };
};

export const setGeolocationURL = (payload) => {
  return {
    type: SET_GEOLOCATION_URL,
    payload,
  };
};

export const setProductInfo = (payload) => {
  return {
    type: SET_PRODUCT_INFO,
    payload,
  };
};
export const setCaptionFontSize = (payload) => ({
  type: SET_CAPTION_FONT_SIZE,
  payload,
});
export const setCaptionBackground = (payload) => ({
  type: SET_CAPTION_BACKGROUND,
  payload,
});

export const setP2PConnection = (payload) => {
  return {
    type: SET_P2P_CONNECTION,
    payload,
  };
};

export const resetInCallCustomParams = () => {
  return {
    type: RESET_IN_CALL_INVOCATION_PARAMS,
  };
};
