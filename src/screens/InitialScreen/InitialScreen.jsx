import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { useExtDataLogin } from "utils/useExtDataLogin";
import logger from "utils/logger";
import { bindActionCreators } from "redux";
import * as appActionCreators from "store/actions/app";
import * as configActionCreators from "store/actions/config";
import MainLogoWhite from "components/MainLogoWhite";
import LoadingBlock from "components/LoadingBlock";
import * as callActionCreators from "store/actions/call";
import * as userActionCreators from "store/actions/user";
import storage from "utils/storage";
import { getPortalFeatures } from "../../services/SoapAPIProvider/soapAPIRequests/PortalFeatures";
import { myAccountRequest } from "../../services/SoapAPIProvider/soapAPIRequests/myAccount";
import { getAuthToken, isUserAuthorized } from "utils/login";
import axios from "axios";
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
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
  ...bindActionCreators(appActionCreators, dispatch),
  ...bindActionCreators(configActionCreators, dispatch),
  ...bindActionCreators(userActionCreators, dispatch),
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
}) => {
  let history = useHistory();
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

  useEffect(
    () => {
      if (!rejoin) {
        init(getInitParams());
      }
      history.listen((location) => {
        logger.warn(
          `URL changed to ${location.pathname}: ${JSON.stringify(
            location.state || {}
          )}`
        );
      });
      setUrlParams(window.location.search);
    },
    // eslint-disable-next-line
    [
      /* on mount only */
    ]
  );

  useEffect(() => {
    const getPortalConfigs = (url) => {
      getPortalFeatures(url)
        .then((data) => {
          setPortalFeatures(data);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    const searchParams = new URLSearchParams(window.location.search);
    if (extDataLoginParametersExist && extDataLoginInProgress) {
      // wait for extDataLogin
    } else if (searchParams.get("portal") && searchParams.get("token")) {
      const portal = searchParams.get("portal");
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
            .join("&");

          const newUrl = `${
            window.location.href.split("?")[0]
          }?${newUrlParams}`;
          window.location = newUrl;
        })
        .catch((err) => {
          console.error(`Error during receiving invocation parameters: ${err}`);
        });
    } else if (searchParams.get("portal") && searchParams.get("roomKey")) {
      if (inited && !tabIsDisabled) {
        getPortalConfigs(
          `${urlPortal.value}/services/VidyoPortalGuestService/`
        );
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
        };

        if (!hasMicrophonePermission) {
          clearTimeout(permissionTimeout.current);
          setTimeout(() => {
            history.push("/GuestBeautyScreen", locationState);
          }, 1000);
        } else if (extDataLoginError) {
          clearTimeout(permissionTimeout.current);
          setTimeout(() => {
            history.push("/GuestBeautyScreen", locationState);
          }, 1000);
        } else if (extDataLoginResponse) {
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
        } else if (!urlWelcomePage.value) {
          permissionTimeout.current = setTimeout(() => {
            startCall(locationState);
          }, 3000);
        } else {
          clearTimeout(permissionTimeout.current);
          setTimeout(() => {
            history.push("/GuestBeautyScreen", locationState);
          }, 1000);
        }
      }
    } else if (searchParams.get("code") && searchParams.get("portal")) {
      // start login with
      // https://login.vidyoclouddev.com/oauth?grant_type=authorization_code&response_type=code&client_id=VidyoConnectWebRTC&redirect_uri=https://localhost.webrtc.com/&state=%3Fportal%3Dhttps%3A%2F%2Fglo.alpha.vidyo.com%26roomKey%3Deod0xjJY
      if (inited && !tabIsDisabled) {
        getAuthToken(searchParams.get("code"))
          .then(({ access_token, expires_in, token_type }) => {
            return myAccountRequest(
              searchParams.get("portal"),
              access_token
            ).then((user) => {
              storage.addItem("user", {
                source: "oauth",
                authToken: access_token,
                portal: searchParams.get("portal"),
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
            history.push("/GuestInitialScreen");
          });
      }
    } else if (storageUser) {
      history.push("/UserHomeScreen");
    } else {
      history.push("/GuestInitialScreen");
    }
  }, [
    history,
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
  ]);

  if (isCallJoining) {
    return (
      <Redirect
        to={{
          pathname: "/JoiningCallScreen",
          state: {
            isCameraTurnedOn: !urlMuteCameraOnJoin.value,
            isMicrophoneTurnedOn: !urlMuteMicrophoneOnJoin.value,
            isSpeakerTurnedOn: true,
            displayName,
            host: urlPortal.value.replace("https://", ""),
            roomKey: urlRoomKey.value,
          },
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
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(InitialScreen);
