import React, { useEffect, useState, useCallback } from "react";
import { connect, useDispatch } from "react-redux";
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
import LoadingBlock from "components/LoadingBlock";
import { useLanguageDirection } from "utils/hooks";
import { useTranslation } from "react-i18next";
import AdHocRoomDialogs from "../../containers/AdHocRoomDialogs";
import { createAdHocRoom } from "../../actions/creators";
import { test } from "utils/helpers";
import "./AdHocBeautyScreen.scss";
import HardwareCheckPopup from "containers/HardwareCheckupPopup/HardwareCheckPopup";
import { isMobileSafari } from "react-device-detect";
import { getPortalFeatures } from "services/SoapAPIProvider/soapAPIRequests/PortalFeatures";

const mapStateToProps = ({ app, call, devices, config, vc_adHocRoom }) => ({
  adHocRoom: vc_adHocRoom,
  isAppInited: app.inited,
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
  extData: config.extData,
  extDataType: config.extDataType,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators(configActionCreators, dispatch),
});

const AdHocBeautyScreen = ({
  adHocRoom,
  isAppInited,
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
  setPortalFeatures,
  speakerTurnOn,
  speakerTurnOff,
  isSpeakerTurnedOn,
  beautyScreenToggle,
  muteCameraOnJoinToggle,
  muteMicrophoneOnJoinToggle,
  setCompositorFixedParticipants,
  getCustomParameters,
  getGCPServicesList,
  urlHWT,
  extData,
  extDataType,
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const languageDirection = useLanguageDirection();
  const [areSettingsRendered, setSettingsRenderState] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState({});
  const [displayName, setDisplayName] = useState(
    location.state?.displayName || storage.getItem("displayName") || ""
  );
  const [isHWTpopupVisble, setHWTVisibilty] = useState(false);
  const [launchHWTPopup, setlaunchHWTPopup] = useState(false);
  const hideHWTOnRejoin = (location.state || {})["hideHWTOnRejoin"] || false;

  if (!location.state) {
    location.state = { host: "" };
  }

  const onJoin = useCallback(
    ({ displayName, roomPin }) => {
      setDisplayName(displayName);
      if (adHocRoom.isCreated) {
        startCall({
          host: adHocRoom.portal,
          roomKey: adHocRoom.roomKey,
          roomPin: roomPin ?? adHocRoom.pin,
          displayName,
        });
      } else {
        dispatch(createAdHocRoom());
      }
    },
    [adHocRoom, dispatch, startCall]
  );

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
            //initFailed();
          });
    };
    if(adHocRoom.portal) {
      getPortalConfigs(
          `${adHocRoom.portal}/services/VidyoPortalGuestService/`
      );
      getCustomParamsAndGCP(adHocRoom.portal);
    }
  }, [adHocRoom, adHocRoom.portal, adHocRoom.roomKey, setPortalFeatures, getCustomParamsAndGCP]);

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
    if (isAppInited && beautyScreenToggle && !muteCameraOnJoinToggle) {
      cameraTurnOn({ selectedCamera });
    }
    return () => {
      cameraTurnOff({ selectedCamera });
    };
    // eslint-disable-next-line
  }, [
    isAppInited,
    cameraTurnOn,
    cameraTurnOff,
    beautyScreenToggle,
    muteCameraOnJoinToggle,
  ]);

  useEffect(() => {
    if (isAppInited && beautyScreenToggle && !muteMicrophoneOnJoinToggle) {
      microphoneTurnOn();
    }
    return () => {
      microphoneTurnOff();
    };
  }, [
    isAppInited,
    microphoneTurnOn,
    microphoneTurnOff,
    beautyScreenToggle,
    muteMicrophoneOnJoinToggle,
  ]);

  useEffect(() => {
    if (isAppInited) {
      speakerTurnOn();
    }
    return () => {
      speakerTurnOff();
    };
  }, [isAppInited, speakerTurnOn, speakerTurnOff]);

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

  if (!isAppInited) {
    return (
      <div className="adhoc-initial-screen">
        <div className="content">
          <MainLogoWhite />
          <div className="initial-loader">
            <LoadingBlock />
          </div>
        </div>
      </div>
    );
  }

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
        }}
      />
    );
  }

  const showHardwarePopup = () => {
    return (
      (extData && extDataType === "1" && urlHWT && !hideHWTOnRejoin) ||
      launchHWTPopup
    );
  };

  return (
    <div className="adhoc-beauty-screen" {...test("ADHOC_BEAUTY_SCREEN")}>
      {showHardwarePopup() && (
        <HardwareCheckPopup
          onPopupClose={() => {
            if (isMobileSafari) setHWTVisibilty(false);

            setlaunchHWTPopup(false);
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
      <AdHocRoomDialogs onJoin={() => onJoin({ displayName })} />
      <Modal>
        {areSettingsRendered && <Settings onClose={toggleSettings} />}
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AdHocBeautyScreen);
