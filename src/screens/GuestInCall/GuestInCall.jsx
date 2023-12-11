import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as devicesActionCreators from "store/actions/devices";
import * as configActionCreators from "store/actions/config";
import * as callActionCreators from "store/actions/call";
import * as userActionCreators from "store/actions/user";
import * as googleAnalytics from "store/actions/googleAnalytics";
import storage from "utils/storage";
import Chat from "containers/Chat";
import Modal from "components/Modal";
import Settings from "containers/Settings";
import { VidyoConnector } from "features";
import InviteToCallPopup from "../../containers/InviteToCall/Popup";
import { isCustomParamEnabled, test } from "utils/helpers";
import useLoki from "utils/useLoki";
import { isUserAuthorized } from "utils/login";
import {
  useKeyboardShortcut,
  useModerationStatuses,
  useCurrentUser,
  useInsightServerUrl,
  useShowJoinNotification,
  useShowLeaveNotification,
  useInactivityTimer,
} from "utils/hooks";
import "./GuestInCall.scss";
import { getEntityByRoomKey } from "services/SoapAPIProvider/soapAPIRequests/getEntityByRoomKey";
import { deviceDisableReason } from "utils/constants";
import { getLectureModeParticipantsRequest } from "services/SoapAPIProvider/soapAPIRequests/getLectureModeParticipants";
import EpicCallMediaCapture from "containers/EpicCallMediaCapture/EpicCallMediaCapture";
import { WebBreakoutRooms } from "features";
import { saveRoomPin } from "store/actions/call";
import { updateUser } from "store/actions/user";
import { aplplyDefaultPortalEffect } from "utils/useBackgroundEffect";
import * as webViewActionCreators from "store/actions/webView";
import * as breakoutRoomsActonCreators from "../../features/BreakoutRooms/actions/creators";
import useVideoAudioContent from "containers/VideoAudioContent/useVideoAudioContent";
import useChatSpecialMessages from "containers/Chat/useChatSpecialMessages";
import { useFECC } from "utils/compositorHooks";
import Header from "./partials/Header/Header";
import Renderer from "./partials/Renderer/Renderer";
import Footer from "./partials/Footer/Footer";
import SidebarBox from "./partials/SidebarBox/SidebarBox";
import useWakeLock from "../../hooks/useWakeLock";
import ReconnectView from "containers/ReconnectView/ReconnectView";
const mapStateToProps = ({
  devices,
  call,
  config,
  user,
  feature_breakoutRooms,
}) => ({
  isCallActive: call.active,
  isCallLeaving: call.leaving,
  disconnectReason: call.disconnectReason,
  participants: call.participants,
  callProperties: call.properties,
  callStartedTime: call.callStartedTime,
  selectedMicrophone: devices.selectedMicrophone,
  isCameraTurnedOn: devices.isCameraTurnedOn,
  isMicrophoneTurnedOn: devices.isMicrophoneTurnedOn,
  isSpeakerTurnedOn: devices.isSpeakerTurnedOn,
  isCameraDisabled: devices.isCameraDisabled,
  isMicrophoneDisabled: devices.isMicrophoneDisabled,
  isSpeakerDisabled: devices.isSpeakerDisabled,
  isStatisticsOverlaySet: config.isStatisticsOverlaySet,
  customParameters: config.customParameters,
  gcpServices: config.listOfGCPServices,
  moderationPanelOpened: call.moderationPanelOpened,
  userIsRegistered: user.isRegistered,
  userInfo: user.userInfo,
  roomInfo: call.roomInfo,
  urlWaitingRoomVideoContent: config.urlWaitingRoomVideoContent,
  urlWaitingRoomAudioContent: config.urlWaitingRoomAudioContent,
  urlWaitingRoomBackgroundContent: config.urlWaitingRoomBackgroundContent,
  urlDoNotSaveDisplayName: config.urlDoNotSaveDisplayName,
  extData: config.extData,
  hasExtData: config.hasExtData,
  extDataType: config.extDataType,
  cameraModerationState: devices.cameraModerationState,
  microphoneModerationState: devices.microphoneModerationState,
  urlModeratorPin: config.urlModeratorPin,
  localWindowShares: call.localWindowShares,
  remoteWindowShares: call.remoteWindowShares,
  isWebViewEnabled: config.urlInitializeWebView.value,
  portalFeatures: config.portalFeatures,
  sendCcAnalytics: call.cc.sendAnalytics,
  jwtToken: config.jwtToken,
  urlSkipParticipantNotifications: config.urlSkipParticipantNotifications.value,
  breakoutRooms: feature_breakoutRooms,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators(configActionCreators, dispatch),
  ...bindActionCreators(googleAnalytics, dispatch),
  ...bindActionCreators(userActionCreators, dispatch),
  ...bindActionCreators(webViewActionCreators, dispatch),
  ...bindActionCreators(breakoutRoomsActonCreators, dispatch),
});

const GuestInCall = ({
  isCallActive,
  isCallLeaving,
  disconnectReason,
  participants,
  callProperties,
  callStartedTime,
  endCall,
  cameraTurnOff,
  isCameraTurnedOn,
  microphoneTurnOff,
  microphoneTurnOn,
  speakerTurnOn,
  speakerTurnOff,
  enablePreview,
  isStatisticsOverlaySet,
  setStatisticsOverlay,
  getCustomParameters,
  customParameters,
  gcpServices,
  moderationPanelOpened,
  userIsRegistered,
  setRoomInfo,
  roomInfo,
  userInfo,
  urlDoNotSaveDisplayName,
  extData,
  extDataType,
  cameraModerationState,
  microphoneModerationState,
  saveParticipantsDetails,
  logout,
  hasExtData,
  urlModeratorPin,
  closeModerationPanel,
  localWindowShares,
  remoteWindowShares,
  showSharePreview,
  setDisableTabletParticipantLimitRestrictions,
  isWebViewEnabled,
  getWebViewDevicesState,
  portalFeatures,
  sendCcAnalytics,
  setCcSendAnalytics,
  jwtToken,
  urlSkipParticipantNotifications,
  breakoutRooms,
}) => {
  const [isSidebarOpen, setSidebarState] = useState(false);
  const [isChatOpen, setChatState] = useState(false);
  const [areSettingsRendered, setSettingsRenderState] = useState(false);
  const [invitePopupOpened, setInvitePopupOpened] = useState(false);
  const [adHocRoomInfoRendered, setAdHocRoomInfoRendered] = useState(false);
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const location = useLocation();
  const [showJoinNotification] = useShowJoinNotification();
  const [showLeaveNotification] = useShowLeaveNotification();
  const [dataForAudioVideoContent, setDataForAudioVideoContent] =
    useVideoAudioContent();
  const { isUserAdmin, isUserRoomOwner } = useModerationStatuses();
  const currentUser = useCurrentUser();
  const insightServerUrl = useInsightServerUrl();
  useLoki(isCallActive, insightServerUrl);
  useInactivityTimer(customParameters, participants, endCall);
  useChatSpecialMessages(currentUser, participants, t);
  useFECC(isWebViewEnabled);

  const callName = callProperties.callName || location.state?.roomKey;
  const afterCallStarted = (new Date().getTime() - callStartedTime) / 1000 > 5;
  const { authToken, portal } = storage.getItem("user") || {};
  const epicServiceAvailable = gcpServices?.epicService?.isServiceAvailable;
  const isEpicServiceEnabled = isCustomParamEnabled(
    userIsRegistered ? customParameters?.epicServiceEnabled : null
  );

  const isCCEnabled =
    portalFeatures?.CcEnabled &&
    gcpServices?.closedCaption?.isServiceAvailable &&
    gcpServices?.closedCaption?.url &&
    !isCustomParamEnabled(customParameters?.closedCaptioningDisabled) &&
    jwtToken;
  const isBrRoomsEnabled = portalFeatures?.BrEnabled;

  const isEnoughWindowSpace = useCallback(() => {
    let value = 480;

    if (isBrRoomsEnabled && isCCEnabled) {
      value += 140;
    }

    return window.innerWidth > 360 + value + 300;
  }, [isBrRoomsEnabled, isCCEnabled]);

  const toggleSettings = useCallback(() => {
    setSettingsRenderState(!areSettingsRendered);
  }, [areSettingsRendered]);

  const pressAdhocRoomInfo = useCallback(() => {
    setAdHocRoomInfoRendered(true);
  }, []);

  const toggleInviteToCallPopup = useCallback(() => {
    setInvitePopupOpened(!invitePopupOpened);
  }, [invitePopupOpened]);

  const toggleSidebar = useCallback(() => {
    if (isChatOpen && !isEnoughWindowSpace() && !isSidebarOpen) {
      setChatState(false);
    }
    setSidebarState(!isSidebarOpen);
  }, [isChatOpen, isEnoughWindowSpace, isSidebarOpen]);

  const toggleChat = useCallback(() => {
    if (isSidebarOpen && !isEnoughWindowSpace() && !isChatOpen) {
      setSidebarState(false);
    }
    setChatState(!isChatOpen);
  }, [isChatOpen, isEnoughWindowSpace, isSidebarOpen]);

  useEffect(() => {
    if (localWindowShares?.length) {
      localWindowShares.forEach((share) => {
        share.SetPreviewLabel({ previewLabel: t("MY_SHARE") });
        if (share.SetEndShareLabel) {
          share.SetEndShareLabel({ endLabel: t("END_SHARE") });
        }
      });
    }
  }, [localWindowShares, t]);

  useEffect(() => {
    const isCameraMutedByModeration =
      (cameraModerationState.moderationType ===
        deviceDisableReason.HARD_MUTED &&
        cameraModerationState.state) ||
      (cameraModerationState.moderationType ===
        deviceDisableReason.SOFT_MUTED &&
        cameraModerationState.state);

    if (isCameraMutedByModeration) {
      cameraTurnOff();
    }
  }, [
    cameraModerationState.moderationType,
    cameraModerationState.state,
    cameraTurnOff,
  ]);

  useEffect(() => {
    remoteWindowShares.forEach((share) => {
      const shareLabel = document.querySelector(
        `.application-type.remote-track[data-participant-id="${share?.participant?.id}"] .video-display-name-main`
      );
      if (shareLabel) {
        shareLabel.innerHTML = `${share.participant.name} (${t("SHARE_NOUN")})`;
      }
    });
  }, [remoteWindowShares, t]);

  useEffect(() => {
    if (isWebViewEnabled) return; // set device state according to Epic Monitor device state
    if (location.state?.isMicrophoneTurnedOn) {
      microphoneTurnOn();
    } else {
      microphoneTurnOff();
    }
  }, [location, microphoneTurnOn, microphoneTurnOff, isWebViewEnabled]);

  useEffect(() => {
    const isMicrophoneMutedByModeration =
      (microphoneModerationState.moderationType ===
        deviceDisableReason.HARD_MUTED &&
        microphoneModerationState.state) ||
      (microphoneModerationState.moderationType ===
        deviceDisableReason.SOFT_MUTED &&
        microphoneModerationState.state);

    if (isMicrophoneMutedByModeration) {
      microphoneTurnOff();
    }
  }, [
    microphoneModerationState.moderationType,
    microphoneModerationState.state,
    microphoneTurnOff,
  ]);

  useEffect(() => {
    if (isWebViewEnabled) return; // set device state according to Epic Monitor device state
    if (location.state?.isSpeakerTurnedOn) {
      speakerTurnOn();
    } else {
      speakerTurnOff();
    }
  }, [location, speakerTurnOn, speakerTurnOff, isWebViewEnabled]);

  useEffect(() => {
    if (isWebViewEnabled) {
      // Get devices state from Epic Monitor and apply appropriate state for our audio devices
      getWebViewDevicesState();
    }
  }, [location, isWebViewEnabled, getWebViewDevicesState]);

  useEffect(() => {
    enablePreview(true);
    showSharePreview(true);
  }, [enablePreview, showSharePreview]);

  useEffect(() => {
    if (isCallActive && !urlDoNotSaveDisplayName.value) {
      storage.addItem("displayName", location.state?.displayName);
    }
  }, [location, isCallActive, urlDoNotSaveDisplayName.value]);

  useEffect(() => {
    const participant = participants.participantJoined;
    if (
      participant &&
      !participant.isLocal &&
      afterCallStarted &&
      !urlSkipParticipantNotifications
    ) {
      showJoinNotification(participant.name);
    }
    // eslint-disable-next-line
  }, [participants.participantJoined]);

  useEffect(() => {
    const participant = participants.participantLeft;
    if (
      participant &&
      !participant.isLocal &&
      isCallActive &&
      !isCallLeaving &&
      !urlSkipParticipantNotifications &&
      !breakoutRooms.isTransferInProgress
    ) {
      showLeaveNotification(participant.name);
    }
    // eslint-disable-next-line
  }, [participants.participantLeft]);

  useEffect(() => {
    return () => {
      setStatisticsOverlay(false);
    };
  }, [setStatisticsOverlay]);

  useEffect(() => {
    const host = location.state.host || portal;
    const isUserAuthorizedValue = isUserAuthorized(host);
    console.log("Is user authorized:", isUserAuthorizedValue);

    if (location.state.isCustomParamsReceived && !isUserAuthorizedValue) return;

    const reqParams = {
      host,
    };
    if (isUserAuthorizedValue) {
      reqParams["authToken"] = authToken;
    }
    getCustomParameters(reqParams, (customParams) => {
      if (!customParams) return;
      aplplyDefaultPortalEffect(
        customParams,
        isWebViewEnabled,
        isUserAuthorizedValue
      );
    });
    // eslint-disable-next-line
  }, [getCustomParameters, isUserAuthorized]);

  useEffect(() => {
    setDisableTabletParticipantLimitRestrictions(true);
    if (userIsRegistered) {
      getEntityByRoomKey(portal, authToken, location.state?.roomKey).then(
        (data) => {
          setRoomInfo(data);
        }
      );
    }

    return () => {
      logout();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (sendCcAnalytics) {
        dispatch(googleAnalytics.closedCaptionCallEnd());
        setCcSendAnalytics(false);
      }
    };
  }, [dispatch, sendCcAnalytics, setCcSendAnalytics]);

  useEffect(() => {
    if (
      extData &&
      extDataType === "1" &&
      roomInfo?.entityID &&
      urlModeratorPin.value
    ) {
      getLectureModeParticipantsRequest(
        portal,
        authToken,
        roomInfo?.entityID,
        urlModeratorPin.value
      )
        .then((res) => {
          if (res) {
            dispatch(
              updateUser({
                accountType: "admin",
                becomeModerator: true,
              })
            );
            dispatch(saveRoomPin(urlModeratorPin.value));
          }
        })
        .catch((e) => {
          console.error("Failed check urlModeratorPin", e);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomInfo.entityID]);

  /*****
   * In case Siderbar and chat is open and window is not enough space width then close the chat popup
   *
   */
  useEffect(() => {
    function onResizeWindow() {
      if (isSidebarOpen && !isEnoughWindowSpace() && isChatOpen) {
        setChatState(false);
      }
    }
    window.addEventListener("resize", onResizeWindow);
    return () => {
      window.removeEventListener("resize", onResizeWindow);
    };
  }, [isSidebarOpen, isChatOpen, isEnoughWindowSpace]);

  useEffect(() => {
    if (roomInfo?.entityID && isUserAdmin && +roomInfo?.RoomMode?.roomPIN) {
      getLectureModeParticipantsRequest(
        portal,
        authToken,
        roomInfo?.entityID,
        roomInfo?.RoomMode?.roomPIN
      ).then((res) => {
        if (res) {
          saveParticipantsDetails(
            res?.Envelope?.Body?.GetLectureModeParticipantsResponse
              ?.LectureModeParticipant
          );
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.list, isUserAdmin, roomInfo?.RoomMode?.roomPIN]);

  useKeyboardShortcut(
    {
      shiftKey: true,
      ctrlKey: true,
      code: "KeyS",
    },
    () => {
      setStatisticsOverlay(!isStatisticsOverlaySet);
    }
  );
  useWakeLock();
  useEffect(() => {
    if (!isUserAdmin && !isUserRoomOwner && moderationPanelOpened) {
      closeModerationPanel();
    }
  }, [
    closeModerationPanel,
    isUserAdmin,
    isUserRoomOwner,
    moderationPanelOpened,
  ]);

  if (isCallLeaving || disconnectReason) {
    return (
      <Navigate replace to={"/LeavingCallScreen"} state={location.state} />
    );
  }

  return (
    <div
      className={`in-call${isSidebarOpen ? " sidebar-is-open" : ""}${
        isChatOpen ? " chat-is-open" : ""
      }`}
      {...test("IN_CALL_MARKER")}
    >
      <ReconnectView></ReconnectView>
      <SidebarBox
        isSidebarOpen={isSidebarOpen}
        callName={callName}
        userIsRegistered={userIsRegistered}
        toggleSidebar={toggleSidebar}
      />
      <div
        className={`call-screen ${
          isWebViewEnabled ? "call-screen--webview" : ""
        }`}
      >
        <Header
          participantsLength={participants.list.length}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          callName={callName}
          toggleSettings={toggleSettings}
          isWebViewEnabled={isWebViewEnabled}
          adHocRoomInfoRendered={adHocRoomInfoRendered}
          pressAdhocRoomInfo={pressAdhocRoomInfo}
        />
        <Renderer
          dataForAudioVideoContent={dataForAudioVideoContent}
          isCameraTurnedOn={isCameraTurnedOn}
          setDataForAudioVideoContent={setDataForAudioVideoContent}
          moderationPanelOpened={moderationPanelOpened}
          userIsRegistered={userIsRegistered}
        />
        <Footer
          isWebViewEnabled={isWebViewEnabled}
          portalFeatures={portalFeatures}
          isBrRoomsEnabled={isBrRoomsEnabled}
          isCCEnabled={isCCEnabled}
          toggleInviteToCallPopup={toggleInviteToCallPopup}
          dataForAudioVideoContent={dataForAudioVideoContent}
          isChatOpen={isChatOpen}
          toggleChat={toggleChat}
        />
      </div>
      <Chat isChatOpen={isChatOpen} toggleChat={toggleChat} />
      <Modal>
        {adHocRoomInfoRendered && (
            <VidyoConnector.AdHocRoom.AdHocRoomInfoDialog
                onClose={() => setAdHocRoomInfoRendered(false)}
            />
        )}
      </Modal>
      <Modal>
        {areSettingsRendered && <Settings onClose={toggleSettings} />}
      </Modal>
      <Modal>
        {invitePopupOpened && (
          <InviteToCallPopup
            onClose={toggleInviteToCallPopup}
            userIsRegistered={userIsRegistered}
            roomInfo={roomInfo}
            userInfo={userInfo}
            customParameters={customParameters}
            gcpServices={gcpServices}
          />
        )}
      </Modal>
      {isCallActive &&
        epicServiceAvailable &&
        isEpicServiceEnabled &&
        hasExtData &&
        +extDataType === 1 && <EpicCallMediaCapture />}
      {isBrRoomsEnabled && <WebBreakoutRooms />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GuestInCall);
