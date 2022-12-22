import React, { useEffect, useState, useCallback, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Navigate, useLocation } from "react-router-dom";
import * as callActionCreators from "store/actions/call";
import * as devicesActionCreators from "store/actions/devices";
import * as configActionCreators from "store/actions/config";
import GuestSettingsIcon from "components/GuestSettingsIcon";
import MainLogoWhite from "components/MainLogoWhite";
import GuestJoin from "containers/GuestJoin";
import Settings from "containers/Settings";
import Modal from "components/Modal";
import Alert from "components/Alert";
import storage from "utils/storage";
import { useLanguageDirection } from "utils/hooks";
import { useTranslation } from "react-i18next";
import { test } from "utils/helpers";
import { isUserAuthorized } from "utils/login";

import "./GuestBeautyScreen.scss";
import HardwareCheckPopup from "containers/HardwareCheckupPopup/HardwareCheckPopup";
import { isMobileSafari, isMobile } from "react-device-detect";
import OperatingSystemInfoProvider from "utils/deviceDetect";
import { loadScript } from "utils/loaders.js";
import { isBackgroundEffectSupported } from "utils/useBackgroundEffect";

const mapStateToProps = ({ call, devices, config }) => ({
  isCallJoining: call.joining,
  disconnectReason: call.disconnectReason,
  selectedCamera: devices.selectedCamera,
  isCameraTurnedOn: devices.isCameraTurnedOn,
  isMicrophoneTurnedOn: devices.isMicrophoneTurnedOn,
  isSpeakerTurnedOn: devices.isSpeakerTurnedOn,
  beautyScreenToggle: config.urlBeautyScreen.value,
  muteCameraOnJoinToggle: config.urlMuteCameraOnJoin.value,
  muteMicrophoneOnJoinToggle: config.urlMuteMicrophoneOnJoin.value,
  urlHWT: config.urlHWT.value,
  customParameters: config.customParameters,
  muteSpeakerOnJoinToggle: config.urlMuteSpeakerOnJoinToggle.value,
  isWebViewEnabled: config.urlInitializeWebView.value,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators(configActionCreators, dispatch),
});

const GuestBeautyScreen = ({
  startCall,
  isCallJoining,
  disconnectReason,
  selectedCamera,
  cameraTurnOn,
  cameraTurnOff,
  isCameraTurnedOn,
  microphoneTurnOn,
  microphoneTurnOff,
  isMicrophoneTurnedOn,
  speakerTurnOn,
  speakerTurnOff,
  isSpeakerTurnedOn,
  beautyScreenToggle,
  muteCameraOnJoinToggle,
  muteMicrophoneOnJoinToggle,
  setCompositorFixedParticipants,
  urlHWT,
  customParameters,
  getCustomParameters,
  muteSpeakerOnJoinToggle,
  isWebViewEnabled,
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const languageDirection = useLanguageDirection();
  const [areSettingsRendered, setSettingsRenderState] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState({});
  const [displayName, setDisplayName] = useState(
    location.state.displayName || storage.getItem("displayName") || ""
  );
  const [isHWTpopupVisble, setHWTVisibilty] = useState(false);
  const [launchHWTPopup, setlaunchHWTPopup] = useState(false);
  const hideHWTOnRejoin = (location.state || {})["hideHWTOnRejoin"] || false;
  const [isHWTLaunched, setIsHWTLaunched] = useState(false);
  const isCustomParamsReceived = useRef(false);
  const { authToken, portal } = storage.getItem("user") || {};
  const onJoin = useCallback(
    ({ displayName, roomPin }) => {
      setDisplayName(displayName);
      startCall({ ...location.state, displayName, roomPin });
    },
    [location, startCall]
  );

  const closeAlert = () => {
    setIsAlertOpen(false);
  };

  const toggleSettings = useCallback(() => {
    setSettingsRenderState(!areSettingsRendered);
  }, [areSettingsRendered]);

  useEffect(() => {
    setCompositorFixedParticipants({
      enableCompositorFixedParticipants:
        window.appConfig.REACT_APP_COMPOSITOR_FIXED_PARTICIPANTS,
    });
  }, [setCompositorFixedParticipants]);

  useEffect(() => {
    if (beautyScreenToggle && !muteCameraOnJoinToggle) {
      cameraTurnOn({ selectedCamera });
    }
    return () => {
      cameraTurnOff({ selectedCamera });
    };
    // eslint-disable-next-line
  }, [cameraTurnOn, cameraTurnOff, beautyScreenToggle, muteCameraOnJoinToggle]);

  useEffect(() => {
    if (beautyScreenToggle && !muteMicrophoneOnJoinToggle) {
      microphoneTurnOn();
    }
    return () => {
      microphoneTurnOff();
    };
  }, [
    microphoneTurnOn,
    microphoneTurnOff,
    beautyScreenToggle,
    muteMicrophoneOnJoinToggle,
  ]);

  useEffect(() => {
    if (muteSpeakerOnJoinToggle) {
      speakerTurnOff();
    }
    if (beautyScreenToggle && !muteSpeakerOnJoinToggle) {
      speakerTurnOn();
    }
    return () => {
      speakerTurnOff();
    };
  }, [
    speakerTurnOn,
    speakerTurnOff,
    beautyScreenToggle,
    muteSpeakerOnJoinToggle,
  ]);

  useEffect(() => {
    // TODO refactor retrieving custom parameters to avoid duplication. For now we ask custom params:
    // guest screen, guest in call, browser check, hwt popup. Need find one place where we will request them.
    const host = location.state.host || portal;
    const isUserAuthorizedValue = isUserAuthorized(host);
    const reqParams = {
      host,
    };
    if (isUserAuthorizedValue) {
      reqParams["authToken"] = authToken;
    }
    getCustomParameters(reqParams, (customParams) => {
      if (!customParams || isWebViewEnabled || !isBackgroundEffectSupported)
        return;
      const customParamList =
        customParams?.[isUserAuthorizedValue ? "registered" : "unregistered"];
      const backgroundEffectDisabledByUser =
        storage.getItem("clearCameraEffect");
      let defaultPortalBackground = customParamList
        ? customParamList.DefaultCameraEffect
        : "";
      if (
        !["BLUR", "NONE"].includes(defaultPortalBackground) &&
        (isMobile || OperatingSystemInfoProvider.IsTabletDevice())
      ) {
        defaultPortalBackground = "";
      }
      isCustomParamsReceived.current = true;
      const onChangePortalBackground = () => {
        window.banuba.aplplyDefaultPortalEffect(
          defaultPortalBackground,
          storage
        );
      };

      if (window.banubaPluginReady) {
        onChangePortalBackground();
      } else if (window.banubaIsLoaded) {
        window.addEventListener(
          "BanubaPluginReady",
          onChangePortalBackground,
          false
        );
      } else if (
        defaultPortalBackground &&
        defaultPortalBackground !== "NONE" &&
        !backgroundEffectDisabledByUser
      ) {
        loadScript("./banuba/BanubaPlugin.js", true);
        window.banubaIsLoaded = true;
        window.addEventListener(
          "BanubaPluginReady",
          onChangePortalBackground,
          false
        );
        if (defaultPortalBackground === "BLUR") {
          storage.addItem("selectedCameraEffect", { id: "blur" });
          storage.addItem("defaultPortalBackground", true);
        }
      }
    });
    // eslint-disable-next-line
  }, [getCustomParameters, isUserAuthorized]);

  useEffect(() => {
    if (disconnectReason) {
      // Don't show alerts for wrong pin code
      if (disconnectReason === "VIDYO_CONNECTORFAILREASON_InvalidToken") {
        return;
      }
      if (disconnectReason === "VIDYO_CONNECTORFAILREASON_ResourceFull") {
        return;
      }
      setAlertMessage({
        header: t("UNABLE_TO_JOIN_CONFERENCE"),
        text: t("ERROR_WHILE_JOINING_CONFERENCE_TRY_AGAIN"),
      });
      if (
        [
          "VIDYO_CONNECTORFAILREASON_RoomLocked",
          "VIDYO_CONNECTORFAILREASON_NotMember",
        ].includes(disconnectReason)
      ) {
        setAlertMessage({
          header: t("ROOM_IS_CURRENTLY_LOCKED"),
          text: t("YOU_CANNOT_JOIN_TO_LOCKED_ROOM"),
        });
      }
      setIsAlertOpen(true);
    }

    // eslint-disable-next-line
  }, [disconnectReason]);

  if (isCallJoining) {
    return (
      <Navigate
        replace
        to={"/JoiningCallScreen"}
        state={{
          ...location.state,
          isCameraTurnedOn: beautyScreenToggle
            ? isCameraTurnedOn
            : !muteCameraOnJoinToggle,
          isMicrophoneTurnedOn: beautyScreenToggle
            ? isMicrophoneTurnedOn
            : !muteMicrophoneOnJoinToggle,
          isSpeakerTurnedOn,
          displayName,
          isCustomParamsReceived: isCustomParamsReceived.current,
        }}
      />
    );
  }

  const showHardwarePopup = () => {
    return (
      ((urlHWT && !hideHWTOnRejoin && !isHWTLaunched) || launchHWTPopup) &&
      !isWebViewEnabled
    );
  };

  return (
    <div className="guest-beauty-screen" {...test("GUEST_BEAUTY_SCREEN")}>
      {showHardwarePopup() && (
        <HardwareCheckPopup
          isVolutanryHardwareCheck={launchHWTPopup}
          onPopupClose={() => {
            if (isMobileSafari) setHWTVisibilty(false);

            setlaunchHWTPopup(false);
            setIsHWTLaunched(true);
          }}
          onPopupLoad={() => {
            if (isMobileSafari) setHWTVisibilty(true);
          }}
        ></HardwareCheckPopup>
      )}
      <GuestSettingsIcon onClick={toggleSettings} />
      <div className="content" dir={languageDirection}>
        <div className="content-blocks">
          <div className="block-1">
            <MainLogoWhite />
            <Alert
              buttonText={t("OK")}
              onConfirm={closeAlert}
              message={alertMessage}
              isOpen={isAlertOpen}
            />
            <GuestJoin
              areSettingsRendered={areSettingsRendered}
              displayName={displayName}
              changeNameDisabled={false}
              beautyScreenToggle={beautyScreenToggle && !isHWTpopupVisble}
              onJoin={onJoin}
              onHardwareLaunchClick={() => {
                setlaunchHWTPopup(true);
              }}
            />
          </div>
        </div>
      </div>
      <Modal>
        {areSettingsRendered && <Settings onClose={toggleSettings} />}
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GuestBeautyScreen);
