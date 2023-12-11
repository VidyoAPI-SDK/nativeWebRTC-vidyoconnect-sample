import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { lockRoomRequest } from "services/SoapAPIProvider/soapAPIRequests/lockRoom";
import {
  closeModerationPanel,
  lockRoom,
  setRoomInfo,
  unLockRoom,
} from "store/actions/call";
import { muteAudioClientAllRequest } from "services/SoapAPIProvider/soapAPIRequests/muteAllMicrophones";
import { muteVideoClientAllRequest } from "services/SoapAPIProvider/soapAPIRequests/muteAllCameras";
import { disconnectConferenceAllRequest } from "services/SoapAPIProvider/soapAPIRequests/disconnectConferenceAll";
import { getModeratorURLWithTokenRequest } from "services/SoapAPIProvider/soapAPIRequests/getModeratorURLWithToken";
import { useModerationStatuses, useTabletDimension } from "utils/hooks";
import FloatingPanel from "components/FloatingPanel/FloatingPanel";
import showNotification from "components/Notifications/Notifications";
import roomLockedIcon from "assets/images/status/locked.svg";
import roomUnlockedIcon from "assets/images/status/unlocked.svg";
import ListItemWithIcon from "components/ListItemWithIcon/ListItemWithIcon";
import "./CallModeration.scss";
import Alert from "components/Alert/Alert";
import storage from "utils/storage";
import { getEntityDetailsByID } from "services/SoapAPIProvider/soapAPIRequests/getEntityDetailsByID";
import { updateUser } from "store/actions/user";
import moderatorIcon from "assets/images/callModeration/become_moderator.png";
import { isDoNotShowMessage, saveDoNotShowMessage } from "utils/helpers";

const CallModeration = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isTablet] = useTabletDimension();
  const [callModerationMenu, setCallModerationMenu] = useState(null);
  const [popupSettings, setPopupSettings] = useState({});
  const [itemsInProgress, setItemsInProgress] = useState([]);
  const { roomInfo } = useSelector((state) => state.call);
  const { userInfo } = useSelector((state) => state.user);
  const { portal, authToken } = storage.getItem("user") || {};
  const { isBecomeModerator, isRoomLocked, isUserRoomOwner } =
    useModerationStatuses();

  const updateRoomDataAndUserType = useCallback(
    (conferenceID) => {
      getEntityDetailsByID(portal, authToken, conferenceID).then((data) => {
        if (
          isBecomeModerator &&
          (data?.RoomMode?.hasPIN === false ||
            data?.RoomMode?.hasPIN === "false")
        ) {
          dispatch(
            updateUser({
              accountType: "Normal",
              becomeModerator: false,
            })
          );
          dispatch(closeModerationPanel());
          showNotification("banner", {
            message: t("CM_ERROR_NO_LONGER_MODERATOR"),
            icon: moderatorIcon,
          });
        }
        dispatch(setRoomInfo(data));
      });
    },
    [authToken, dispatch, isBecomeModerator, portal, t]
  );

  const lockRoomHandler = useCallback(() => {
    setItemsInProgress((prev) => [...prev, "cm_lockRoom"]);
    lockRoomRequest(
      portal,
      authToken,
      roomInfo?.entityID,
      roomInfo?.RoomMode?.roomPIN
    ).then((res) => {
      if (res?.Envelope?.Body?.LockRoomResponse?.OK === "OK") {
        setPopupSettings({});
        dispatch(lockRoom());
        showNotification("banner", {
          message: t("THE_ROOM_IS_NOW_LOCKED"),
          icon: roomLockedIcon,
        });
        setItemsInProgress((prev) =>
          prev.filter((item) => item !== "cm_lockRoom")
        );
      } else {
        updateRoomDataAndUserType(roomInfo?.entityID);
      }
    });
  }, [
    authToken,
    dispatch,
    portal,
    roomInfo.RoomMode.roomPIN,
    roomInfo.entityID,
    t,
    updateRoomDataAndUserType,
  ]);

  const unLockRoomHandler = useCallback(() => {
    setItemsInProgress((prev) => [...prev, "cm_lockRoom"]);
    lockRoomRequest(
      portal,
      authToken,
      roomInfo?.entityID,
      roomInfo?.RoomMode?.roomPIN,
      false
    ).then((res) => {
      if (res?.Envelope?.Body?.UnlockRoomResponse?.OK === "OK") {
        dispatch(unLockRoom());
        showNotification("banner", {
          message: t("THE_ROOM_IS_NOW_UNLOCKED"),
          icon: roomUnlockedIcon,
        });
        setItemsInProgress((prev) =>
          prev.filter((item) => item !== "cm_lockRoom")
        );
      } else {
        updateRoomDataAndUserType(roomInfo?.entityID);
      }
    });
  }, [
    authToken,
    dispatch,
    portal,
    roomInfo.RoomMode.roomPIN,
    roomInfo.entityID,
    t,
    updateRoomDataAndUserType,
  ]);

  const muteAllMicrophonesHandler = useCallback(() => {
    setItemsInProgress((prev) => [...prev, "cm_muteAllMicrophones"]);
    let isChecked = false;

    const confirm = () => {
      setPopupSettings({});
      if (isChecked) {
        saveDoNotShowMessage("CM_SOFT_MUTE_MICROPHONES_WARNING");
      }
      muteAudioClientAllRequest(
        portal,
        authToken,
        roomInfo?.entityID,
        roomInfo?.RoomMode?.roomPIN
      ).then((res) => {
        if (res?.Envelope?.Body?.muteAudioClientAllResponse?.OK === "OK") {
          setItemsInProgress((prev) =>
            prev.filter((item) => item !== "cm_muteAllMicrophones")
          );
        } else {
          updateRoomDataAndUserType(roomInfo?.entityID);
        }
      });
    };

    if (!isDoNotShowMessage("CM_SOFT_MUTE_MICROPHONES_WARNING")) {
      setPopupSettings({
        isOpen: true,
        text: t("CM_SOFT_MUTE_MICROPHONES_WARNING"),
        cancelButtonText: t("CANCEL"),
        buttonText: t("CONTINUE"),
        onConfirm: confirm,
        className: "cm-popup",
        onCancel: () => {
          setPopupSettings({});
          setItemsInProgress((prev) =>
            prev.filter((item) => item !== "cm_muteAllMicrophones")
          );
        },
        checkbox: {
          label: t("CM_DO_NOT_SHOW_ANYMORE"),
          checked: isChecked,
          onChange: () => (isChecked = !isChecked),
        },
      });
    } else {
      confirm();
    }
  }, [authToken, portal, roomInfo, t, updateRoomDataAndUserType]);

  const muteAllCamerasHandler = useCallback(() => {
    setItemsInProgress((prev) => [...prev, "cm_turnOffAllCameras"]);
    let isChecked = false;

    const confirm = () => {
      setPopupSettings({});
      if (isChecked) {
        saveDoNotShowMessage("CM_SOFT_MUTE_CAMERAS_WARNING");
      }
      muteVideoClientAllRequest(
        portal,
        authToken,
        roomInfo?.entityID,
        roomInfo?.RoomMode?.roomPIN
      ).then((res) => {
        if (res?.Envelope?.Body?.muteVideoClientAllResponse?.OK === "OK") {
          setItemsInProgress((prev) =>
            prev.filter((item) => item !== "cm_turnOffAllCameras")
          );
        } else {
          updateRoomDataAndUserType(roomInfo?.entityID);
        }
      });
    };

    if (!isDoNotShowMessage("CM_SOFT_MUTE_CAMERAS_WARNING")) {
      setPopupSettings({
        isOpen: true,
        text: t("CM_SOFT_MUTE_CAMERAS_WARNING"),
        cancelButtonText: t("CANCEL"),
        buttonText: t("CONTINUE"),
        onConfirm: confirm,
        className: "cm-popup",
        onCancel: () => {
          setPopupSettings({});
          setItemsInProgress((prev) =>
            prev.filter((item) => item !== "cm_turnOffAllCameras")
          );
        },
        checkbox: {
          label: t("CM_DO_NOT_SHOW_ANYMORE"),
          checked: isChecked,
          onChange: () => (isChecked = !isChecked),
        },
      });
    } else {
      confirm();
    }
  }, [authToken, portal, roomInfo, t, updateRoomDataAndUserType]);

  const disconnectAllHandler = useCallback(() => {
    setItemsInProgress((prev) => [...prev, "cm_disconectAllParticipants"]);

    setPopupSettings({
      isOpen: true,
      text: t("CM_DISCONNECT_ALL_WARNING"),
      cancelButtonText: t("CANCEL"),
      buttonText: t("OK"),
      onConfirm: () => {
        setPopupSettings({});
        disconnectConferenceAllRequest(
          portal,
          authToken,
          roomInfo?.entityID,
          roomInfo?.RoomMode?.roomPIN
        ).then((res) => {
          if (
            res?.Envelope?.Body?.disconnectConferenceAllResponse?.OK === "OK"
          ) {
            setItemsInProgress((prev) =>
              prev.filter((item) => item !== "cm_disconectAllParticipants")
            );
          } else {
            updateRoomDataAndUserType(roomInfo?.entityID);
          }
        });
      },
      className: "cm-popup cm-popup--center",
      onCancel: () => {
        setPopupSettings({});
        setItemsInProgress((prev) =>
          prev.filter((item) => item !== "cm_disconectAllParticipants")
        );
      },
    });
  }, [authToken, portal, roomInfo, t, updateRoomDataAndUserType]);

  const openInBrowserHandler = useCallback(() => {
    setItemsInProgress((prev) => [...prev, "cm_openInBrowser"]);
    getModeratorURLWithTokenRequest(
      portal,
      authToken,
      roomInfo?.entityID,
      +roomInfo?.RoomMode?.roomPIN
    ).then((res) => {
      const url =
        res?.Envelope?.Body?.GetModeratorURLWithTokenResponse?.moderatorURL;
      if (url) {
        setItemsInProgress((prev) =>
          prev.filter((item) => item !== "cm_openInBrowser")
        );
        window.open(url, "_blank");
      }
    });
  }, [authToken, portal, roomInfo]);

  const closePanelHandler = () => {
    dispatch(closeModerationPanel());
  };

  useEffect(() => {
    let callModerationMenu = [
      {
        label: isRoomLocked ? t("CM_UNLOCK_ROOM") : t("CM_LOCK_ROOM"),
        onClickHandler: isRoomLocked ? unLockRoomHandler : lockRoomHandler,
        id: "cm_lockRoom",
        className: isRoomLocked ? "vtcl-cm-unlock" : "vtcl-cm-lock",
        tooltip: isRoomLocked
          ? t("CM_UNLOCK_ROOM_TOOLTIP")
          : t("CM_LOCK_ROOM_TOOLTIP"),
      },
      {
        label: t("CM_SOFT_MUTE_MIC_ALL"),
        labelActive: t("CM_SOFT_MUTE_MIC_ALL"),
        onClickHandler: muteAllMicrophonesHandler,
        id: "cm_muteAllMicrophones",
        className: "vtcl-cm-soft-mute-microphones",
        tooltip: t("CM_SOFT_MUTE_MIC_ALL_TIP"),
      },
      {
        label: t("CM_SOFT_MUTE_CAM_ALL"),
        labelActive: t("CM_SOFT_MUTE_CAM_ALL"),
        onClickHandler: muteAllCamerasHandler,
        id: "cm_turnOffAllCameras",
        className: "vtcl-cm-soft-mute-cameras",
        tooltip: t("CM_SOFT_MUTE_CAM_ALL_TIP"),
      },
      {
        label: t("CM_DISCONNECT_ALL"),
        labelActive: t("CM_DISCONNECT_ALL"),
        onClickHandler: disconnectAllHandler,
        id: "cm_disconectAllParticipants",
        className: "vtcl-cm-disconnect-all",
      },
      {
        label:
          t("CM_OPEN_WEB_MODERATION") +
          (roomInfo.RoomMode.roomPIN && isBecomeModerator
            ? ` (PIN: ${roomInfo.RoomMode.roomPIN})`
            : ""),
        labelActive: t("CM_OPEN_WEB_MODERATION"),
        onClickHandler: openInBrowserHandler,
        id: "cm_openInBrowser",
        className: "vtcl-cm-open-link",
      },
    ];

    if (!isUserRoomOwner) {
      callModerationMenu = callModerationMenu.filter(
        (el) => el.id !== "cm_lockRoom"
      );
    }

    setCallModerationMenu(callModerationMenu);
  }, [
    disconnectAllHandler,
    isRoomLocked,
    isUserRoomOwner,
    lockRoomHandler,
    muteAllCamerasHandler,
    muteAllMicrophonesHandler,
    openInBrowserHandler,
    roomInfo,
    roomInfo.RoomMode.isLocked,
    roomInfo.RoomMode.roomPIN,
    t,
    unLockRoomHandler,
    userInfo.entityID,
    isBecomeModerator,
  ]);

  if (isTablet) {
    return (
      <>
        <Alert
          isOpen={popupSettings.isOpen}
          onConfirm={popupSettings.onConfirm}
          message={{
            text: popupSettings.text,
          }}
          className={popupSettings.className}
          onCancel={popupSettings.onCancel}
          cancelButtonText={popupSettings.cancelButtonText}
          buttonText={popupSettings.buttonText}
          checkbox={popupSettings.checkbox}
        />
        <div className="cm-mobile">
          <div className="cm-mobile__title">{t("MODERATE_CALL")}</div>
          <ul className="cm-mobile__list">
            {callModerationMenu.map((item) => {
              if (isTablet) item.tooltip = null;
              return (
                <ListItemWithIcon data={item} isBigStyle={true} key={item.id} />
              );
            })}
          </ul>
        </div>
      </>
    );
  }

  return (
    <>
      {
        <Alert
          isOpen={popupSettings.isOpen}
          onConfirm={popupSettings.onConfirm}
          message={{
            text: popupSettings.text,
          }}
          className={popupSettings.className}
          onCancel={popupSettings.onCancel}
          cancelButtonText={popupSettings.cancelButtonText}
          buttonText={popupSettings.buttonText}
          checkbox={popupSettings.checkbox}
        />
      }
      <FloatingPanel
        title={t("MODERATE_CALL")}
        className="cm-panel"
        list={callModerationMenu}
        onClose={closePanelHandler}
        itemsInProgress={itemsInProgress}
      />
    </>
  );
};

export default CallModeration;
