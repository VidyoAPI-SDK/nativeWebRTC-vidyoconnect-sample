import React, { useEffect, useRef, useCallback } from "react";
import { connect } from "react-redux";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useExtDataLogin } from "utils/useExtDataLogin";
import logger from "utils/logger";
import { bindActionCreators } from "redux";
import * as appActionCreators from "store/actions/app";
import * as configActionCreators from "store/actions/config";
import MainLogoWhite from "components/MainLogoWhite";
import LoadingBlock from "components/LoadingBlock";
import * as callActionCreators from "store/actions/call";
import * as userActionCreators from "store/actions/user";
import * as webViewActionCreators from "store/actions/webView";
import storage from "utils/storage";
import { getPortalFeatures } from "../../services/SoapAPIProvider/soapAPIRequests/PortalFeatures";
import { myAccountRequest } from "../../services/SoapAPIProvider/soapAPIRequests/myAccount";
import { getAuthToken, isUserAuthorized } from "utils/login";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./InitialScreen.scss";

if (!storage.getItem("waitingLogin")) {
  storage.removeItem("user");
}
storage.removeItem("waitingLogin");

const mapStateToProps = ({ app, config, call, devices }) => ({
  app,
  config,
  isCallJoining: call.joining,
  disconnectReason: call.disconnectReason,
  hasMicrophonePermission:
    !devices.microphoneDisableReasons.includes("NO_PERMISSION"),
  isWebViewEnabled: config.urlInitializeWebView.value,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
  ...bindActionCreators(appActionCreators, dispatch),
  ...bindActionCreators(configActionCreators, dispatch),
  ...bindActionCreators(userActionCreators, dispatch),
  ...bindActionCreators(webViewActionCreators, dispatch),
});

export const getInitParams = () => {
  const params = {
    skipPermissionsCheck: false,
    enableVcGa: false,
  };
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("skipPermissionsCheck")) {
    params.skipPermissionsCheck = ["true", "1"].includes(
      searchParams.get("skipPermissionsCheck")
    );
  }
  if (searchParams.has("enableVcGa")) {
    params.enableVcGa = ["true", "1"].includes(searchParams.get("enableVcGa"));
  }
  return params;
};

const storageUser = storage.getItem("user") || null;

const InitialScreen = ({
  app,
  config,
  init,
  setExtData,
  enableDebugLogLevel,
  setUrlParams,
  setPortalFeatures,
  startCall,
  isCallJoining,
  hasMicrophonePermission,
  setUser,
  getEndpointBehaviour,
  setEndpointBehaviour,
  isWebViewEnabled,
  initializeWebView,
  getCustomParameters,
  getGCPServicesList,
  initFailed,
}) => {
  let navigate = useNavigate();
  let location = useLocation();
  let { inited, tabIsDisabled } = app;
  let {
    urlPortal,
    urlRoomKey,
    urlDisplayName,
    urlDebug,
    urlPin,
    urlExtData,
    urlExtDataType,
    urlWelcomePage,
    urlMuteCameraOnJoin,
    urlMuteMicrophoneOnJoin,
    urlMuteSpeakerOnJoinToggle,
  } = config;

  const rejoin = (location.state || {})["rejoin"] || false;
  let [
    extDataLoginParametersExist,
    extDataLoginInProgress,
    extDataLoginResponse,
    extDataLoginError,
  ] = useExtDataLogin(rejoin);

  const displayName =
    urlDisplayName.value || storage.getItem("displayName") || "";
  const permissionTimeout = useRef(null);
  const { t } = useTranslation();
  useEffect(
    () => {
      if (!rejoin) {
        init(getInitParams());
      }
      setUrlParams(window.location.search);
    },
    // eslint-disable-next-line
    [
      /* on mount only */
    ]
  );

  useEffect(() => {
    if (!window?.chrome?.webview) {
      console.log(
        "WebView was not initialized since window.chrome.webview = ",
        window?.chrome?.webview
      );
      return undefined;
    }
    console.log(`isWebViewEnabled = ${isWebViewEnabled}`);
    if (isWebViewEnabled) {
      initializeWebView();
    }
  }, [initializeWebView, isWebViewEnabled]);

  useEffect(() => {
    logger.warn(
      `URL changed to ${location.pathname}: ${JSON.stringify(
        location.state || {}
      )}`
    );
  }, [location]);

  const getCustomParamsAndGCP = useCallback(
    async (host, authToken) => {
      try {
        const params = {
          host,
          authToken,
        };
        getCustomParameters(params, (customParameters) => {
          if (!customParameters) {
            return null;
          }
          // vidyoCloudServicesURL from localStorage has higher priority than from portal
          // for debuging
          const { vidyoCloudServicesURL } =
            storage.getItem("vidyoCloudServicesURL") ||
            customParameters[authToken ? "registered" : "unregistered"];

          if (!vidyoCloudServicesURL) {
            console.error(`vidyoCloudServicesURL not available`);
            return;
          }

          getGCPServicesList({ vidyoCloudServicesURL });
        });
      } catch (error) {
        console.error("Error while getCustomParamsAndGCP: ", error);
      }
    },
    [getCustomParameters, getGCPServicesList]
  );

  useEffect(() => {
    const getPortalConfigs = (url) => {
      getPortalFeatures(url)
        .then((data) => {
          setPortalFeatures(data);
        })
        .catch((err) => {
          console.error(err);
          initFailed();
        });
    };
    const searchParams = new URLSearchParams(window.location.search);
    if (extDataLoginParametersExist && extDataLoginInProgress) {
      // wait for extDataLogin
    } else if (searchParams.get("portal") && searchParams.get("token")) {
      const portal = decodeURIComponent(searchParams.get("portal") || "");
      const token = searchParams.get("token");
      console.log(
        `Getting invocation parameters: ${portal}/api/v1/invokeParameters?token=${token}`
      );

      axios
        .get(`${portal}/api/v1/invokeParameters?token=${token}`)
        .then((res) => {
          const invocationParameters = res.data;
          console.log(
            `Received invocation parameters: ${JSON.stringify(
              invocationParameters
            )}`
          );
          if (!invocationParameters) {
            return console.error(`Empty invocation parameters`);
          }
          if (invocationParameters.invoke !== "join") {
            console.warn(`Unexpected invocation parameters`);
          }

          const newUrlParams = Object.keys(invocationParameters || {})
            .map((key) => {
              return `${encodeURIComponent(key)}=${encodeURIComponent(
                invocationParameters[key]
              )}`;
            })
            .join("&")
            .concat("&", `sessionToken=${token}`);

          const newUrl = `${
            window.location.href.split("?")[0]
          }?${newUrlParams}`;
          window.location.replace(newUrl);
        })
        .catch((err) => {
          console.error(`Error during receiving invocation parameters: ${err}`);
        });
    } else if (searchParams.get("portal") && searchParams.get("roomKey")) {
      if (inited && !tabIsDisabled) {
        getPortalConfigs(
          `${urlPortal.value}/services/VidyoPortalGuestService/`
        );
        if (isUserAuthorized(urlPortal.value)) {
          const { authToken } = storage.getItem("user");
          getCustomParamsAndGCP(urlPortal.value, authToken);
        } else {
          getCustomParamsAndGCP(urlPortal.value);
        }

        if (urlExtData.value && ["1", "2"].includes(urlExtDataType.value)) {
          setExtData({
            extData: urlExtData.value,
            extDataType: urlExtDataType.value,
          });
        }
        if (urlDebug.value) {
          enableDebugLogLevel();
        }

        let locationState = {
          host: urlPortal.value.replace("https://", ""),
          roomKey: urlRoomKey.value,
          displayName,
          roomPin: urlPin.value || "",
          hasExtData: urlExtData.value && urlExtDataType.value === "1",
          hideHWTOnRejoin: rejoin,
        };

        if (!hasMicrophonePermission) {
          clearTimeout(permissionTimeout.current);
          setTimeout(() => {
            navigate("/GuestBeautyScreen", { state: locationState });
          }, 1000);
        } else if (extDataLoginError) {
          clearTimeout(permissionTimeout.current);
          setTimeout(() => {
            navigate("/GuestBeautyScreen", { state: locationState });
          }, 1000);
        } else if (extDataLoginResponse) {
          const { authToken } = storage.getItem("user");
          getCustomParamsAndGCP(urlPortal.value, authToken);

          setUser();
          if (extDataLoginResponse?.endpointBehavior) {
            setEndpointBehaviour(extDataLoginResponse.endpointBehavior);
          }
          permissionTimeout.current = setTimeout(() => {
            startCall(locationState);
          }, 3000);
        } else if (isUserAuthorized(urlPortal.value)) {
          setUser();
          getEndpointBehaviour();
          permissionTimeout.current = setTimeout(() => {
            startCall(locationState);
          }, 3000);
        } else if (!urlWelcomePage.value && displayName !== "") {
          permissionTimeout.current = setTimeout(() => {
            startCall(locationState);
          }, 3000);
        } else {
          clearTimeout(permissionTimeout.current);
          setTimeout(() => {
            navigate("/GuestBeautyScreen", { state: locationState });
          }, 1000);
        }
      }
    } else if (searchParams.get("code") && searchParams.get("portal")) {
      // start login with
      // https://login.vidyoclouddev.com/oauth?grant_type=authorization_code&response_type=code&client_id=VidyoConnectWebRTC&redirect_uri=https://localhost.webrtc.com/&state=%3Fportal%3Dhttps%3A%2F%2Fglo.alpha.vidyo.com%26roomKey%3Deod0xjJY
      if (inited && !tabIsDisabled) {
        let portal = decodeURIComponent(searchParams.get("portal") || "");
        getAuthToken(searchParams.get("code"))
          .then(({ access_token, expires_in, token_type }) => {
            return myAccountRequest(portal, access_token).then((user) => {
              // getCustomParamsAndGCP(urlPortal.value, access_token);
              storage.addItem("user", {
                source: "oauth",
                authToken: access_token,
                portal,
              });
              storage.addItem("displayName", user.displayName);
              return user;
            });
          })
          .then((user) => {
            storage.addItem("waitingLogin", true);
            window.location.search = searchParams.get("state");
          })
          .catch((err) => {
            console.error(err);
            navigate("/GuestInitialScreen");
          });
      }
    } else if (storageUser) {
      navigate("/UserHomeScreen");
    } else {
      navigate("/GuestInitialScreen");
    }
  }, [
    navigate,
    init,
    setExtData,
    enableDebugLogLevel,
    inited,
    tabIsDisabled,
    urlPortal.value,
    urlRoomKey.value,
    urlDebug.value,
    urlPin.value,
    urlExtData.value,
    urlExtDataType.value,
    urlWelcomePage.value,
    displayName,
    startCall,
    hasMicrophonePermission,
    setPortalFeatures,
    extDataLoginParametersExist,
    extDataLoginInProgress,
    extDataLoginResponse,
    extDataLoginError,
    setUser,
    setEndpointBehaviour,
    getEndpointBehaviour,
    getCustomParamsAndGCP,
    rejoin,
    initFailed,
  ]);

  if (isCallJoining) {
    return (
      <Navigate
        replace
        to={"/JoiningCallScreen"}
        state={{
          isCameraTurnedOn: !urlMuteCameraOnJoin.value,
          isMicrophoneTurnedOn: !urlMuteMicrophoneOnJoin.value,
          isSpeakerTurnedOn: !urlMuteSpeakerOnJoinToggle.value,
          displayName,
          host: urlPortal.value.replace("https://", ""),
          roomKey: urlRoomKey.value,
        }}
      />
    );
  }

  return (
    <div className="initial-screen">
      <div className="content">
        <MainLogoWhite />
        <div className="initial-loader">
          <LoadingBlock />
          <div aria-live="assertive" role="alert" className="message">
            {t("WAIT_WHILE_PAGE_LOADING")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(InitialScreen);
