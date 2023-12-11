import React from "react";
import showNotification from "components/Notifications";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import clipBoard from "utils/clipboard";
import linkIcon from "assets/images/buttons/link.svg";

const RoomLink = () => {
  const { t } = useTranslation();
  const { roomUrl, pin } = useSelector((state) => state.vc_adHocRoom);

  const copyRoomLinkHandler = () => {
    clipBoard.copyText(roomUrl).then((res) => {
      if (res) {
        showNotification("banner", {
          message: t("ROOM_LINK_COPIED_TO_CLIPBOARD"),
          icon: linkIcon,
        });
      }
    });
  };

  const copyRoomPinHandler = () => {
    clipBoard.copyText(pin).then((res) => {
      if (res) {
        showNotification("banner", {
          message: t("The room pin is copied to clipboard."),
          icon: linkIcon,
        });
      }
    });
  };

  if (!roomUrl) {
    return null;
  }

  return (
    <>
      <div className="header-room-link">
        <div
          className="header-room-link__copy"
          onClick={copyRoomLinkHandler}
        ></div>
        <div className="header-room-link__url">{roomUrl}</div>
      </div>
      {pin && (
        <div className="header-room-link">
          <div
            className="header-room-link__copy"
            onClick={copyRoomPinHandler}
          ></div>
          <div className="header-room-link__url">PIN: {pin}</div>
        </div>
      )}
    </>
  );
};

export default RoomLink;
