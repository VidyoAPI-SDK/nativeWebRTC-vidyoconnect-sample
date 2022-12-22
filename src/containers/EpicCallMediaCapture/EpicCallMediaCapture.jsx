import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  b64toBlob,
  copyStyles,
  guid,
  takeVideoSnapShot,
} from "../../utils/helpers";
import { Login } from "services/SoapAPIProvider/soapAPIRequests/Login";
import SnapShotPopup from "components/SnapShotPopup/SnapShotPopup";
import storage from "utils/storage";
import { useTranslation } from "react-i18next";
import {
  useCurrentUser,
  useMobileDimension,
  useOrientation,
} from "utils/hooks";
import LandScapeModePopup from "components/LandScapeModePopup/LandScapeModePopup";
import hunterChat from "utils/hunterChat";
import { sendChatMessage } from "store/actions/chat";
import { setJwtToken, setRefreshToken } from "store/actions/config";
import { portalJWTRequest } from "utils/portalJWTRequest";
import showNotification from "components/Notifications/Notifications";
import Portal from "components/Portal/Portal";
import useEpicCallSession, {
  handleEpicCallError,
} from "utils/useEpicCallSession";

import "./EpicCallMediaCapture.scss";

const windowTypesSnapShot = {
  main: "MAIN_WINDOW",
  share: "SHARE_WINDOW",
};

const specialMessageInfo = {
  specMessageClass: "MSGCLASS_HUNTER",
  specMessageType: "MSGTYPE_PRIVATE",
};

const EpicCallMediaCapture = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isMobileDimension] = useMobileDimension();
  const [orientation] = useOrientation();
  const {
    urlEpicCallLaunchToken,
    listOfGCPServices,
    jwtToken,
    epicCallSessionStarted,
    epicCallDocumentTypes,
  } = useSelector((state) => state.config);
  const call = useSelector((state) => state.call);
  const compositorTiles = useSelector((state) => state.call.compositorTiles);
  const [showSnapshotPopup, setShowSnapshotPopup] = useState(false);
  const [showUndockedSnapshotPopup, setShowUndockedSnapshotPopup] =
    useState(false);
  const [sendMediaInProgress, setSendMediaInProgress] = useState(false);
  const [sendMediaInProgressUndocked, setSendMediaInProgressUndocked] =
    useState(false);
  const [imageData, setImageData] = useState(null);
  const [undockedImageData, setUndockedImageData] = useState(null);
  const [isUndocked, setIsUndocked] = useState(false);
  const currentUser = useCurrentUser();
  const epicCallMediaAPIServer = listOfGCPServices?.epicService?.url;
  const { authToken, portal } = storage.getItem("user") || {};
  const undockedWindowDocument = useRef(null);

  useEpicCallSession();

  const onSendingError = (isUndock) => {
    if (isUndock) {
      setShowUndockedSnapshotPopup(false);
      setSendMediaInProgressUndocked(false);
    } else {
      setShowSnapshotPopup(false);
      setSendMediaInProgress(false);
    }

    return showNotification(
      "bannerWithBtns",
      {
        type: "banner",
        showFor: 10000,
        message: t("SNAPHOT_SAVED_ERROR_MESSAGE"),
        buttons: [
          {
            autoClickAfterNSeconds: 10,
            text: `${t("HIDE")}`,
          },
        ],
      },
      isUndock ? undockedWindowDocument.current?.body : null
    );
  };

  const sendMedia = async (isUndock, mediaData, description, documentType) => {
    if (!mediaData || !description || !documentType) {
      throw Error("EPIC Call Media Capture: sendMedia() some param is missing");
    }

    const imageData = b64toBlob(mediaData);
    const formData = new FormData();

    formData.append("documentType", documentType);
    formData.append("description", description);
    formData.append("file", imageData, "xray.png");

    const options = {
      url: `${epicCallMediaAPIServer}/media`,
      data: formData,
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/json",
      },
    };

    try {
      if (isUndock) {
        setSendMediaInProgressUndocked(true);
      } else {
        setSendMediaInProgress(true);
      }
      const res = await portalJWTRequest(options);

      return res.data;
    } catch (e) {
      handleEpicCallError(e, "error occur while send image to ERP");
      onSendingError(isUndock);
    }
  };

  const getMediaStatus = async (mediaId) => {
    const options = {
      url: `${epicCallMediaAPIServer}/media/status`,
      method: "GET",
      params: {
        mediaId,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    };
    try {
      const res = await portalJWTRequest(options);

      if (res?.data?.data?.state === "PROGRESSING") {
        return new Promise((resolve) => {
          setTimeout(resolve, 2000);
        }).then(getMediaStatus.bind(null, mediaId));
      }

      return res;
    } catch (e) {
      handleEpicCallError(e, "error occur while fetching media status");
      onSendingError();
    }
  };

  const saveSnapShotERP = async function (
    isUndock,
    imageData,
    documentType,
    description
  ) {
    const today = new Date();
    const date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    const time =
      today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    const dateTime = date + "-" + time;
    const fileName = "snapShot-" + dateTime + ".jpeg";

    try {
      const sendMediaResponse = await sendMedia(
        isUndock,
        imageData,
        description,
        documentType,
        fileName
      );

      if (sendMediaResponse?.status === "success") {
        const mediaId = sendMediaResponse?.data?.mediaId;

        if (mediaId) {
          getMediaStatus(mediaId)
            .then((res) => {
              if (res?.data?.data?.state === "COMPLETED") {
                showNotification(
                  "bannerWithBtns",
                  {
                    type: "banner",
                    className: "snapshot-success",
                    showFor: 10000,
                    message: t("SNAPHOT_SAVED_ERP_MESSAGE"),
                    buttons: [
                      {
                        autoClickAfterNSeconds: 10,
                        text: `${t("HIDE")}`,
                      },
                    ],
                  },
                  isUndock ? undockedWindowDocument.current?.body : null
                );
                if (isUndock) {
                  setSendMediaInProgressUndocked(false);
                  closeUndockedSnapShotPopup();
                } else {
                  setSendMediaInProgress(false);
                  closeSnapShotPopup();
                }
              } else {
                throw new Error("Media status response = FAILED");
              }
            })
            .catch((e) => {
              handleEpicCallError(e, "error occur while getting media status");
              onSendingError(isUndock);
            });
        } else {
          throw new Error(`Error on getting mediId. mediaId=${mediaId}`);
        }

        return sendMediaResponse;
      }
    } catch (e) {
      handleEpicCallError(e, "error occur while saving image on ERP");
      onSendingError(isUndock);
    }
  };

  /**
   * Handle click on Tile
   */
  const snapshotButtonClickHandler = useCallback(
    (event, isUndock) => {
      if (epicCallSessionStarted && event.target.closest(".make-snapshot")) {
        const container = event.target.closest(".video-container");
        const isShare = container.classList.contains("application-type");
        const participantID = container?.dataset?.participantId;

        const remoteUserID = (call.participants.list || []).find(
          (p) => p.id === participantID
        )?.userId;
        const currentUserID = currentUser?.userId;

        if (remoteUserID) {
          const messageType = isShare ? 2 : 1;
          const messageData = {
            snapshotOf: remoteUserID,
            sendBy: currentUserID,
            messageType,
          };

          const message = hunterChat.createMessage(
            messageData,
            specialMessageInfo,
            null,
            true,
            "snapshot"
          );

          dispatch(sendChatMessage({ message }));
        }

        if (container) {
          const tile = container.querySelector("video");
          if (!tile) return;
          const imageData = takeVideoSnapShot(tile);
          if (imageData) {
            if (isUndock) {
              setUndockedImageData(imageData);
              setShowUndockedSnapshotPopup(true);
            } else {
              setImageData(imageData);
              setShowSnapshotPopup(true);
            }
          }
        }
      }
    },
    [call.participants.list, currentUser, dispatch, epicCallSessionStarted]
  );

  const closeSnapShotPopup = () => {
    setShowSnapshotPopup(false);
    setSendMediaInProgress(false);
  };

  const closeUndockedSnapShotPopup = () => {
    setShowUndockedSnapshotPopup(false);
    setSendMediaInProgressUndocked(false);
  };

  useEffect(() => {
    if (!urlEpicCallLaunchToken.value || !epicCallDocumentTypes) {
      return undefined;
    }

    const _isUndocked = compositorTiles.some((t) => !!t.isUndocked);
    if (!_isUndocked) {
      setIsUndocked(false);
      undockedWindowDocument.current = null;
      setShowUndockedSnapshotPopup(false);
    }
    compositorTiles.forEach(({ element, isUndocked = false }) => {
      let snapShotBtn = element.querySelector(".make-snapshot");

      if (!snapShotBtn) {
        if (
          !element.classList.contains("video-muted") &&
          !element.classList.contains("local-track")
        ) {
          const controls = element.querySelector(".video-tile-controls");

          if (controls) {
            snapShotBtn = controls.insertAdjacentHTML(
              "beforeend",
              '<div class="tile-control make-snapshot"><div class="vc-compositor-tooltip make-snapshot__tooltip js-snapshot-tooltip">' +
                t("SNAPSHOT_QUALITY_MESSAGE") +
                "</div></div>"
            );
          }
        }
      } else {
        const tooltip = snapShotBtn.querySelector(".js-snapshot-tooltip");
        tooltip.innerHTML = t("SNAPSHOT_QUALITY_MESSAGE");
      }

      if (isUndocked) {
        const button = element.querySelector(".make-snapshot");
        if (!button) return;
        const _document = button.ownerDocument;

        if (undockedWindowDocument.current === _document) return;
        undockedWindowDocument.current = _document;

        _document.addEventListener("click", (e) => {
          snapshotButtonClickHandler(e, true);
        });

        copyStyles(window.document, undockedWindowDocument.current);

        //overwrite copied body styles from main window
        const bodyStyle = "body { background: #000; }",
          head = _document.head || _document.getElementsByTagName("head")[0],
          style = _document.createElement("style");

        head.appendChild(style);

        style.type = "text/css";
        style.appendChild(_document.createTextNode(bodyStyle));
        setIsUndocked(true);
      }

      if (!snapShotBtn) {
        snapShotBtn = element.querySelector(".make-snapshot");

        if (!snapShotBtn) return;
      }

      if (!element.classList.contains("video-muted")) {
        snapShotBtn.classList.remove("hide");
      } else {
        snapShotBtn.classList.add("hide");
      }
    });
  }, [
    compositorTiles,
    epicCallDocumentTypes,
    snapshotButtonClickHandler,
    t,
    urlEpicCallLaunchToken.value,
  ]);

  useEffect(() => {
    if (!jwtToken) {
      Login(portal, authToken, {
        returnJwtTokens: true,
        endpointGuid: guid(),
      }).then((res) => {
        if (res) {
          dispatch(setJwtToken(res?.jwtToken));
          dispatch(setRefreshToken(res?.refreshToken));
        }
      });
    }
  }, [authToken, dispatch, jwtToken, portal]);

  useEffect(() => {
    document.addEventListener("click", snapshotButtonClickHandler);

    return () => {
      document.removeEventListener("click", snapshotButtonClickHandler);
    };
  }, [snapshotButtonClickHandler]);

  const renderPopup = (windowType) => {
    const mobileLandscape = isMobileDimension && orientation === "landscape";
    const isShow =
      windowType === windowTypesSnapShot.main
        ? showSnapshotPopup
        : showUndockedSnapshotPopup;
    const _imageData =
      windowType === windowTypesSnapShot.main ? imageData : undockedImageData;
    const _closeSnapShotPopup =
      windowType === windowTypesSnapShot.main
        ? closeSnapShotPopup
        : closeUndockedSnapShotPopup;
    const _sendMediaInProgress =
      windowType === windowTypesSnapShot.main
        ? sendMediaInProgress
        : sendMediaInProgressUndocked;
    const _saveSnapShotERP =
      windowType === windowTypesSnapShot.main
        ? saveSnapShotERP.bind(null, false)
        : saveSnapShotERP.bind(null, true);

    if (isShow) {
      return (
        <>
          <SnapShotPopup
            hide={mobileLandscape}
            imageData={_imageData}
            onClose={_closeSnapShotPopup}
            onSaveERP={_saveSnapShotERP}
            documentMediaTypes={epicCallDocumentTypes}
            containerClass={_sendMediaInProgress ? "in-progress" : ""}
          />
          {mobileLandscape && (
            <LandScapeModePopup
              title={t("MEDIA_CAPTURE_NOT_WORK_IN_LANDSCAPE_MODE")}
            />
          )}
        </>
      );
    }
    return null;
  };

  return (
    <>
      {renderPopup(windowTypesSnapShot.main)}
      {isUndocked && (
        <Portal target={undockedWindowDocument.current.body}>
          {renderPopup(windowTypesSnapShot.share)}
        </Portal>
      )}
    </>
  );
};

export default EpicCallMediaCapture;
