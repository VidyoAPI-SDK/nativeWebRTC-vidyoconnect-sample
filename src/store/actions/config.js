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
  SET_REFRESH_TOKEN,
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

export const setUrlParams = (url) => {
  const payload = {};

  const searchParams = new URLSearchParams(url);

  if (searchParams.has("portal")) {
    payload.urlPortal = { isDefault: false };
    payload.urlPortal.value = searchParams.get("portal") || "";
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

export const getCustomParameters = (payload) => {
  return {
    type: GET_CUSTOM_PARAMETERS,
    payload,
  };
};

export const sendSMS = (payload, callback) => {
  return {
    type: SEND_SMS,
    payload,
    callback,
  };
};

export const getGCPServicesList = (payload) => {
  return {
    type: GET_GCP_SERVICES_LIST,
    payload,
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

export const setRefreshToken = (payload) => {
  return {
    type: SET_REFRESH_TOKEN,
    payload,
  };
};

const transformToBoolean = (value) => {
  return ["true", "1"].includes(value);
};
