import showNotification from "components/Notifications/Notifications";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import clipBoard from "utils/clipboard";
import linkIcon from "assets/images/buttons/link.svg";
import "./RoomLink.scss";

export const RoomLink = () => {
  const { t } = useTranslation();
  const call = useSelector((state) => state.call);
  const user = useSelector((state) => state.user);
  // eslint-disable-next-line
  const isUserOwner = user.userInfo?.entityID !== call.roomInfo?.ownerID;

  const portal = useSelector((state) => state.config.urlPortal.value);
  const roomKey = useSelector((state) => state.config.urlRoomKey.value);

  const getRoomLink = () => {
    if (call.roomInfo?.RoomMode?.roomURL) {
      return call.roomInfo?.RoomMode?.roomURL;
    }
    return `${portal}/join/${roomKey}`;
  };

  const copyRoomLinkHandler = () => {
    clipBoard.copyText(getRoomLink()).then((res) => {
      if (res) {
        showNotification("banner", {
          message: t("ROOM_LINK_COPIED_TO_CLIPBOARD"),
          icon: linkIcon,
        });
      }
    });
  };

  if (!user.isRegistered) {
    return null;
  }

  return (
    <div className="header-room-link">
      <div
        role="button"
        tabIndex="0"
        aria-label={t("COPY_ROOM_LINK")}
        className="header-room-link__copy"
        onClick={copyRoomLinkHandler}
      ></div>
      <div className="header-room-link__url">{getRoomLink()}</div>
    </div>
  );
};
