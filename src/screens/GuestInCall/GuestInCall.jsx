import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as devicesActionCreators from "store/actions/devices";
import * as configActionCreators from "store/actions/config";
import * as callActionCreators from "store/actions/call";
import * as userActionCreators from "store/actions/user";
import * as chatActionCreators from "store/actions/chat";
import * as googleAnalytics from "store/actions/googleAnalytics";
import { Button, Icon, Position, Tooltip } from "@blueprintjs/core";
import storage from "utils/storage";
import Sidebar from "components/Sidebar";
import Chat from "containers/Chat";
import ChatToggle from "containers/Chat/Toggle";
import ShareButton from "containers/Share/Button";
import RecorderStatus from "containers/RecorderStatus";
import CallQualityIndicator from "containers/CallQualityIndicator";
import SecureConnectionStatus from "containers/SecureConnectionStatus";
import FlipCameraButton from "containers/FlipCameraButton";
import Modal from "components/Modal";
import showNotification from "components/Notifications";
import Settings from "containers/Settings";
import InviteToCallButton from "../../containers/InviteToCall/Button";
import InviteToCallPopup from "../../containers/InviteToCall/Popup";
import participantLeftIcon from "assets/images/notifications/left_call.svg";
import participantJoinedIcon from "assets/images/notifications/joined_call.svg";
import CameraToggle from "containers/QuickMediaSettings/toggles/CameraToggle";
import MicrophoneToggle from "containers/QuickMediaSettings/toggles/MicrophoneToggle";
import SpeakerToggle from "containers/QuickMediaSettings/toggles/SpeakerToggle";
import {
  isCustomParamEnabled,
  test,
  unsafeParseTextFromHTMLString,
  getFormattedString,
} from "utils/helpers";
import logger from "utils/logger";
import useLoki from "utils/useLoki";
import { isUserAuthorized } from "utils/login";
import CallStatusMessage from "components/CallStatusMessage";
import {
  isMobile as isMobileDevice,
  isMobileSafari,
  isAndroid,
} from "react-device-detect";
import {
  useKeyboardShortcut,
  useMobileDimension,
  useVisibility,
  useWindowBlur,
  useIsTouchScreen,
  useTabletDimension,
  useModerationStatuses,
  useCurrentUser,
  useInsightServerUrl,
} from "utils/hooks";
import "./GuestInCall.scss";
import { SettingsButton } from "components/SettingsButton/SettingsButton";
import CallModeration from "containers/CallModeration/CallModeration";
import { getEntityByRoomKey } from "services/SoapAPIProvider/soapAPIRequests/getEntityByRoomKey";
import { RoomLink } from "containers/RoomLink/RoomLink";
import VideoAudioContent from "../../containers/VideoAudioContent";
import { deviceDisableReason } from "utils/constants";
import { getLectureModeParticipantsRequest } from "services/SoapAPIProvider/soapAPIRequests/getLectureModeParticipants";
import EpicCallMediaCapture from "containers/EpicCallMediaCapture/EpicCallMediaCapture";
import hunterChat from "utils/hunterChat";
import { VidyoConnector, Stethoscope } from "features";
import { saveRoomPin } from "store/actions/call";
import { updateUser } from "store/actions/user";
import { CSSTransition } from "react-transition-group";
import ParticipantsList from "containers/ParticipantsList/ParticipantsList";
import SidebarModeratorControls from "containers/SidebarModeratorControls/SidebarModeratorControls";
import { getCallAPIProvider } from "services/CallAPIProvider";
import OperatingSystemInfoProvider from "utils/deviceDetect";
import { loadScript } from "utils/loaders.js";
import { isBackgroundEffectSupported } from "utils/useBackgroundEffect";

const mapStateToProps = ({ devices, call, config, user, chat }) => ({
  isCallActive: call.active,
  isCallLeaving: call.leaving,
  disconnectReason: call.disconnectReason,
  participants: call.participants,
  callProperties: call.properties,
  callStartedTime: call.callStartedTime,
  selectedCamera: devices.selectedCamera,
  selectedMicrophone: devices.selectedMicrophone,
  selectedSpeaker: devices.selectedSpeaker,
  isCameraTurnedOn: devices.isCameraTurnedOn,
  isMicrophoneTurnedOn: devices.isMicrophoneTurnedOn,
  isSpeakerTurnedOn: devices.isSpeakerTurnedOn,
  isCameraDisabled: devices.isCameraDisabled,
  isMicrophoneDisabled: devices.isMicrophoneDisabled,
  isSpeakerDisabled: devices.isSpeakerDisabled,
  isStatisticsOverlaySet: config.isStatisticsOverlaySet,
  leftPanelToggle: config.urlLeftPanel.value,
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
  chatSpecialMessage: chat.specialMessage,
  urlModeratorPin: config.urlModeratorPin,
  localWindowShares: call.localWindowShares,
  remoteWindowShares: call.remoteWindowShares,
  pinnedParticipant: call.participants?.pinned,
  remoteCameras: devices.remoteCameras,
  compositorTiles: call.compositorTiles,
  isWebViewEnabled: config.urlInitializeWebView.value,
  isFeccOpen: call.feccOpen,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators(configActionCreators, dispatch),
  ...bindActionCreators(googleAnalytics, dispatch),
  ...bindActionCreators(userActionCreators, dispatch),
  ...bindActionCreators(chatActionCreators, dispatch),
});

const GuestInCall = ({
  isCallActive,
  isCallLeaving,
  disconnectReason,
  participants,
  callProperties,
  callStartedTime,
  endCall,
  cameraTurnOn,
  cameraTurnOff,
  isCameraTurnedOn,
  microphoneTurnOff,
  microphoneTurnOn,
  speakerTurnOn,
  speakerTurnOff,
  selectedCamera,
  assignVideoRenderer,
  enablePreview,
  isStatisticsOverlaySet,
  setStatisticsOverlay,
  leftPanelToggle,
  getCustomParameters,
  customParameters,
  gcpServices,
  getGCPServicesList,
  resetGCPServicesList,
  moderationPanelOpened,
  userIsRegistered,
  setRoomInfo,
  roomInfo,
  userInfo,
  selectedSpeaker,
  urlWaitingRoomVideoContent,
  urlWaitingRoomAudioContent,
  urlWaitingRoomBackgroundContent,
  urlDoNotSaveDisplayName,
  extData,
  extDataType,
  cameraModerationState,
  microphoneModerationState,
  saveParticipantsDetails,
  logout,
  hasExtData,
  addMessageClass,
  chatSpecialMessage,
  urlModeratorPin,
  qaEpicWaitingRoomMediaContent,
  closeModerationPanel,
  localWindowShares,
  remoteWindowShares,
  showSharePreview,
  pinParticipantSuccess,
  resetPinParticipant,
  pinnedParticipant,
  remoteCameras,
  setDisableTabletParticipantLimitRestrictions,
  setFeccPresetsLabel,
  setFeccPresetsSelectLabel,
  compositorTiles,
  isWebViewEnabled,
  isFeccOpen,
}) => {
  const feccPanel = useRef();
  const location = useLocation();
  const { t } = useTranslation();
  const renderer = "renderer";
  const isBlurred = useWindowBlur();
  const isTouchScreen = useIsTouchScreen();
  const [isBackground] = useVisibility();
  const [isMobileDimension] = useMobileDimension();
  const [isSidebarOpen, setSidebarState] = useState(false);
  const [isChatOpen, setChatState] = useState(false);
  const [areSettingsRendered, setSettingsRenderState] = useState(false);
  const [adHocRoomInfoRendered, setAdHocRoomInfoRendered] = useState(false);
  const [invitePopupOpened, setInvitePopupOpened] = useState(false);
  const [dataForAudioVideoContent, setDataForAudioVideoContent] =
    useState(null);
  const callName = callProperties.callName || location.state?.roomKey;
  const afterCallStarted = (new Date().getTime() - callStartedTime) / 1000 > 5;
  const ONLY_PARTICIPANT_CALL_END_TIME = 15;
  const [isTablet] = useTabletDimension();
  const { authToken, portal } = storage.getItem("user") || {};
  const { isUserAdmin, isUserRoomOwner } = useModerationStatuses();
  const dispatch = useDispatch();
  const epicServiceAvailable = gcpServices?.epicService?.isServiceAvailable;
  const isEpicServiceEnabled = isCustomParamEnabled(
    customParameters.registered?.epicServiceEnabled
  );
  const inactivityTimer =
    customParameters?.[userIsRegistered ? "registered" : "unregistered"]
      ?.InactivityTimer;
  const showInviteButton =
    isUserAuthorized(location.state?.host) && (isUserAdmin || isUserRoomOwner);

  const currentUser = useCurrentUser();

  const insightServerUrl = useInsightServerUrl();

  const isCallQualityIndicatorEnabled =
    customParameters?.[userIsRegistered ? "registered" : "unregistered"]
      ?.callQualityIndicatorEnabled === "1";

  useLoki(isCallActive, insightServerUrl);

  function handleEndCallClick() {
    endCall();
  }

  function toggleSettings() {
    setSettingsRenderState(!areSettingsRendered);
  }

  function toggleInviteToCallPopup() {
    setInvitePopupOpened(!invitePopupOpened);
  }

  const toggleSidebar = useCallback(() => {
    if (isChatOpen && !isEnoughWindowSpace() && !isSidebarOpen) {
      setChatState(false);
    }
    setSidebarState(!isSidebarOpen);
  }, [isChatOpen, isSidebarOpen]);

  function toggleChat() {
    if (isSidebarOpen && !isEnoughWindowSpace() && !isChatOpen) {
      setSidebarState(false);
    }
    setChatState(!isChatOpen);
  }

  function isEnoughWindowSpace() {
    return window.innerWidth > 360 + 480 + 300;
  }

  useEffect(() => {
    const isAway = isBackground || (isMobileSafari && isBlurred);

    if (isCameraTurnedOn && isMobileDevice && isAway) {
      cameraTurnOff();
    }
  }, [cameraTurnOff, isCameraTurnedOn, isBackground, isBlurred]);

  useEffect(() => {
    if (selectedCamera && selectedCamera.SetPreviewTag) {
      selectedCamera.SetPreviewTag({ previewTag: t("YOU") });
    }
  }, [selectedCamera, t]);

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
    if (location.state?.isCameraTurnedOn) {
      cameraTurnOn({ selectedCamera });
    } else {
      cameraTurnOff({ selectedCamera });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraTurnOff, cameraTurnOn, location]);

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
    if (location.state?.isMicrophoneTurnedOn) {
      microphoneTurnOn();
    } else {
      microphoneTurnOff();
    }
  }, [location, microphoneTurnOn, microphoneTurnOff]);

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
    if (location.state?.isSpeakerTurnedOn) {
      speakerTurnOn();
    } else {
      speakerTurnOff();
    }
  }, [location, speakerTurnOn, speakerTurnOff]);

  useEffect(() => {
    assignVideoRenderer({
      viewId: renderer,
    });
  }, [assignVideoRenderer]);

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
    if (participant && !participant.isLocal && afterCallStarted) {
      showNotification("banner", {
        title: unsafeParseTextFromHTMLString(participant.name),
        message: t("HAS_JOINED_THE_CONFERENCE"),
        icon: participantJoinedIcon,
        showFor: 2500,
      });
    }
    // eslint-disable-next-line
  }, [participants.participantJoined]);

  useEffect(() => {
    const participant = participants.participantLeft;
    if (participant && !participant.isLocal && isCallActive && !isCallLeaving) {
      showNotification("banner", {
        title: unsafeParseTextFromHTMLString(participant.name),
        message: t("LEFT_THE_CONFERENCE"),
        icon: participantLeftIcon,
        showFor: 2500,
      });
    }
    // eslint-disable-next-line
  }, [participants.participantLeft]);
  const INACTIVITY_TIME_OUT =
    inactivityTimer / 60 || ONLY_PARTICIPANT_CALL_END_TIME;
  useEffect(() => {
    if (participants.list.length === 1) {
      let onlyParticipantLastTime = new Date().getTime();
      const interval = setInterval(() => {
        if (
          (new Date().getTime() - onlyParticipantLastTime) / 1000 / 60 >
          INACTIVITY_TIME_OUT
        ) {
          logger.warn(
            `User is alone in the call more than ${INACTIVITY_TIME_OUT} minutes. Exiting.`
          );
          getCallAPIProvider().exitAfterAloneInCall = true;
          endCall();
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [participants, endCall, INACTIVITY_TIME_OUT]);

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
      if (!customParams || isWebViewEnabled || !isBackgroundEffectSupported)
        return;
      const backgroundEffectDisabledByUser =
        storage.getItem("clearCameraEffect");
      const customParamList =
        customParams?.[isUserAuthorizedValue ? "registered" : "unregistered"];
      let defaultPortalBackground = customParamList
        ? customParamList.DefaultCameraEffect
        : "";
      if (
        !["BLUR", "NONE"].includes(defaultPortalBackground) &&
        (isMobileDevice || OperatingSystemInfoProvider.IsTabletDevice())
      ) {
        defaultPortalBackground = "";
      }
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
    if (customParameters?.registered?.vidyoCloudServicesURL) {
      // vidyoCloudServicesURL from localStorage has higher priority than from portal
      const vidyoCloudServicesURL =
        storage.getItem("vidyoCloudServicesURL") ||
        customParameters.registered.vidyoCloudServicesURL;
      getGCPServicesList({ vidyoCloudServicesURL });
    }
    return () => {
      resetGCPServicesList();
    };
  }, [customParameters, getGCPServicesList, resetGCPServicesList]);

  useEffect(() => {
    // allow receiving of special HUNTER messages in VidyoClient
    addMessageClass("MSGCLASS_HUNTER");

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
  }, [isSidebarOpen, isChatOpen]);

  useEffect(() => {
    if (
      urlWaitingRoomVideoContent.value ||
      urlWaitingRoomAudioContent.value ||
      urlWaitingRoomBackgroundContent.value
    ) {
      const userCustomParams =
        customParameters?.[userIsRegistered ? "registered" : "unregistered"];
      // Only for Epic users with extData and extDataType === 1, according to Phase 1
      if (userCustomParams && extData && extDataType === "1") {
        const data = {};
        if (urlWaitingRoomVideoContent.value)
          data.videoURL =
            userCustomParams[`wrvc${urlWaitingRoomVideoContent.value}`];
        if (urlWaitingRoomAudioContent.value)
          data.audioURL =
            userCustomParams[`wrac${urlWaitingRoomAudioContent.value}`];
        if (urlWaitingRoomBackgroundContent.value)
          data.backgroundURL =
            userCustomParams[`wrbc${urlWaitingRoomBackgroundContent.value}`];

        const mappedInvocationParams = {
          videoURL: "wrvc",
          audioURL: "wrac",
          backgroundURL: "wrbc",
        };

        const matchedData = Object.keys(data).filter((item) => {
          if (data[item]) return true;
          console.error(
            `Not matched data in custom parameters for ${mappedInvocationParams[item]} parameter (${item})`
          );
          return false;
        });

        if (matchedData.length) {
          setDataForAudioVideoContent(data);
        }
      }
    }
  }, [
    customParameters,
    setDataForAudioVideoContent,
    urlWaitingRoomVideoContent,
    urlWaitingRoomAudioContent,
    urlWaitingRoomBackgroundContent,
    extData,
    extDataType,
    userIsRegistered,
  ]);

  useEffect(() => {
    // Clear DataForAudioVideoContent when another participant joined to avoid playing audio/video content at the end of the call
    // and show share and chat.
    if (participants.list.length > 1 && dataForAudioVideoContent) {
      setDataForAudioVideoContent(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.list, setDataForAudioVideoContent]);

  const renderAudioVideoContent = () => {
    if (dataForAudioVideoContent) {
      const { videoURL, audioURL, backgroundURL } = dataForAudioVideoContent;
      return (
        <VideoAudioContent
          selectedSpeaker={selectedSpeaker}
          videoURL={videoURL}
          audioURL={audioURL}
          backgroundURL={backgroundURL}
          onErrorCallback={() => setDataForAudioVideoContent(null)}
          sendAnalytics={qaEpicWaitingRoomMediaContent}
        />
      );
    }
    return null;
  };

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

  useEffect(() => {
    const specialMessage = chatSpecialMessage?.message?.body;

    if (specialMessage) {
      const parsedMessage = hunterChat.parseSpecialMessage(specialMessage);

      if (parsedMessage?.specMessageBody?.includes?.("snapshot")) {
        const receivedData = hunterChat.parseFetureMessage(
          parsedMessage?.specMessageBody
        );

        if (receivedData?.snapshotOf === currentUser?.userId) {
          const sentByName = (participants.list || []).find(
            (p) => p.userId === receivedData?.sendBy
          )?.name;

          if (!sentByName) {
            console.log(
              `EPIC Call Media Capture: Person is not in the call. Skip showing snapshot notification.`
            );
            return;
          }

          const popupMessage =
            receivedData?.messageType === 1
              ? "SNAPSHOT_VIDEO"
              : "SNAPSHOT_SHARE";
          showNotification("bannerWithBtns", {
            type: "banner",
            showFor: 10000,
            message: getFormattedString(
              t(popupMessage),
              sentByName || t("UNKNOWN")
            ),
            buttons: [
              {
                autoClickAfterNSeconds: 10,
                text: `${t("HIDE")}`,
              },
            ],
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatSpecialMessage]);

  useEffect(() => {
    /**
     * Handle click on Tile pin button
     */
    const tilePinButtonHandler = (event) => {
      const pinBtn = event?.target?.closest?.(".pin-participant");
      const feccBtn = event?.target?.closest?.(".control-participant");

      if (pinBtn || feccBtn) {
        const tile = event.target.closest(".video-container");
        const participantID = tile?.dataset?.participantId;

        if (!tile || !participantID) return;

        if (tile.classList.contains("pinned-video")) {
          if (pinBtn) {
            resetPinParticipant();
          }
        } else {
          const participant = participants.list.find(
            (p) => p.id === participantID
          );
          pinParticipantSuccess(participant);
        }
      }
    };

    document.addEventListener("click", tilePinButtonHandler, true);

    return () => {
      document.removeEventListener("click", tilePinButtonHandler, true);
    };
  }, [participants.list, pinParticipantSuccess, resetPinParticipant]);

  /**
   * Resetting participant pin(local state) when he was pinned and his camera has been turned off
   */
  useEffect(() => {
    if (pinnedParticipant) {
      if (
        !remoteCameras.some((c) => c?.participant?.id === pinnedParticipant?.id)
      ) {
        resetPinParticipant();
      }
    }
  }, [remoteCameras, pinnedParticipant, resetPinParticipant]);

  useEffect(() => {
    setFeccPresetsLabel(t("CAMERA_PRESET"));
    setFeccPresetsSelectLabel(t("SELECT_PRESET"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    compositorTiles.forEach(({ element }) => {
      let feccTooltip = element.querySelector(".js-fecc-tooltip");
      const feccButton = element.querySelector(
        ".tile-control.control-participant"
      );

      if (!feccTooltip) {
        if (
          !element.classList.contains("video-muted") &&
          !element.classList.contains("local-track")
        ) {
          if (feccButton) {
            feccTooltip = document.createElement("div");
            feccTooltip.classList.add(
              "vc-compositor-tooltip",
              "js-fecc-tooltip"
            );
            feccTooltip.textContent = t("ADJUST_CAMERA");
            feccButton.appendChild(feccTooltip);
          }
        }
      } else {
        feccTooltip.textContent = t("ADJUST_CAMERA");
      }
    });
  }, [compositorTiles, t]);

  useEffect(() => {
    /**
     * On small epic monitor sizes fecc panel overflows screen
     * workaround for setting compact view
     */
    const setCompactView = () => {
      if (feccPanel.current) {
        feccPanel.current.SetCompactView(true);
      }
    };

    if (isWebViewEnabled && isFeccOpen) {
      feccPanel.current = document.querySelector("fecc-controls-view");
      if (feccPanel.current) {
        setCompactView();
      } else {
        setTimeout(() => {
          feccPanel.current = document.querySelector("fecc-controls-view");
          setCompactView();
        }, 1000);
      }

      window.addEventListener("resize", setCompactView);
    } else {
      window.removeEventListener("resize", setCompactView);
      feccPanel.current = null;
    }

    return () => {
      window.removeEventListener("resize", setCompactView);
      feccPanel.current = null;
    };
  }, [isFeccOpen, isWebViewEnabled]);

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
      <CSSTransition
        in={isSidebarOpen}
        unmountOnExit
        timeout={300}
        classNames="open"
      >
        <Sidebar
          isOpen={isSidebarOpen}
          content={
            <>
              <div className="room-name">{callName}</div>
              <ParticipantsList />
              {userIsRegistered && <SidebarModeratorControls />}
            </>
          }
          toggleSidebar={toggleSidebar}
        />
      </CSSTransition>
      <div
        className={`call-screen ${
          isWebViewEnabled ? "call-screen--webview" : ""
        }`}
      >
        {isWebViewEnabled ? (
          <div className="header">
            {leftPanelToggle && (
              <div
                className={`side-bar-toggle ${isSidebarOpen ? "close" : ""}`}
                {...test("ROSTER_BUTTON")}
                onClick={toggleSidebar}
              ></div>
            )}
          </div>
        ) : (
          <div className="header">
            <Tooltip
              content={t("PARTICIPANTS")}
              position={Position.RIGHT}
              disabled={isTouchScreen}
              portalClassName="device-tooltip"
            >
              <div
                className={`side-bar-toggle ${isSidebarOpen ? "close" : ""}`}
                {...test("ROSTER_BUTTON")}
                onClick={toggleSidebar}
                hidden={!leftPanelToggle}
              ></div>
            </Tooltip>
            <div
              className="participants-count"
              {...test("PARTICIPANTS_AMOUNT")}
            >
              {participants.list.length}
            </div>
            <div className="room-name" {...test("CONFERENCE_NAME")}>
              {callName}
            </div>
            <div className="header-section-right">
              {!isMobileDimension && (
                <Icon
                  icon="info-sign"
                  size={28}
                  onClick={() => setAdHocRoomInfoRendered(true)}
                />
              )}
              {!isMobileDimension &&
                (<VidyoConnector.AdHocRoom.RoomLink /> || <RoomLink />)}
              <SecureConnectionStatus />
              <RecorderStatus />
              {isCallQualityIndicatorEnabled && <CallQualityIndicator />}
              <SettingsButton toggleSettings={toggleSettings} />
            </div>
          </div>
        )}
        <div
          className={`render-container${
            (isMobileDevice || isMobileDimension) && dataForAudioVideoContent
              ? " video-audio-content-on"
              : ""
          }`}
        >
          {participants.list.length === 1 && (
            <>
              <CallStatusMessage
                title={t("YOU_ONLY_ONE_PERSON_IN_CALL")}
                description={t("AS_OTHERS_JOIN_CALL_YOU_WILL_SEE_THEM")}
              />
              {renderAudioVideoContent()}
            </>
          )}
          {moderationPanelOpened && userIsRegistered && !isTablet && (
            <CallModeration />
          )}
          <div id="renderer"></div>
          <Stethoscope.ControlPanel />
        </div>
        {isWebViewEnabled ? (
          <div className="call-controls">
            <div className="webview-end-call-button">
              <Tooltip
                content={t("LEAVE_THE_CALL")}
                disabled={isTouchScreen}
                position={Position.TOP}
                portalClassName="device-tooltip"
              >
                <Button
                  className="end-call-button"
                  {...test("END_CALL_BUTTON")}
                  onClick={handleEndCallClick}
                />
              </Tooltip>
            </div>
          </div>
        ) : (
          <div className="call-controls">
            <div className="left-side-controls">
              <Tooltip
                content={t("LEAVE_THE_CALL")}
                disabled={isTouchScreen}
                position={Position.TOP}
                portalClassName="device-tooltip"
              >
                <Button
                  className="end-call-button"
                  {...test("END_CALL_BUTTON")}
                  onClick={handleEndCallClick}
                />
              </Tooltip>
            </div>

            <div className="main-controls">
              <div className="main-controls-block-left">
                <SpeakerToggle />
                <MicrophoneToggle />
              </div>
              <div className="main-controls-block-right">
                <CameraToggle />
                {(isMobileSafari || isAndroid || isMobileDimension) && (
                  <FlipCameraButton />
                )}
              </div>
            </div>

            <div className="right-side-controls">
              {showInviteButton && (
                <Tooltip
                  content={t("INVITE_TO_CALL")}
                  disabled={isTouchScreen}
                  position={Position.TOP}
                  portalClassName="device-tooltip"
                >
                  <InviteToCallButton onClick={toggleInviteToCallPopup} />
                </Tooltip>
              )}
              {!dataForAudioVideoContent && (
                <Tooltip
                  content={t("SHARE_APPLICATIONS")}
                  disabled={isTouchScreen}
                  position={Position.TOP}
                  portalClassName="device-tooltip"
                >
                  <ShareButton />
                </Tooltip>
              )}
              <Tooltip
                content={t("IN_CALL_CHAT")}
                disabled={isTouchScreen}
                position={Position.TOP}
                portalClassName="device-tooltip"
              >
                <ChatToggle isChatOpen={isChatOpen} onClick={toggleChat} />
              </Tooltip>
            </div>
          </div>
        )}
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
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GuestInCall);
