import showNotification from "components/Notifications/Notifications";
import React from "react";
import { useTranslation } from "react-i18next";
import clipBoard from "utils/clipboard";
import { test } from "utils/helpers";
import linkIcon from "assets/images/buttons/link.svg";
import "./LinkTab.scss";
import { useSelector } from "react-redux";

const LinkTab = () => {
  const { t } = useTranslation();
  const call = useSelector((state) => state.call);
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

  return (
    <div
      className="invite-to-call-tab-content link-tab-content"
      {...test("INVITE_LINK_TAB")}
    >
      <div className="invite-to-call-content-body">
        <div className="invite-link">
          <p className="invite-link__text">{t("COPY_TO_CLIPBOARD")}</p>
          <p className="invite-link__url">{getRoomLink()}</p>
          <button
            id="copy-link-btn"
            className={`invite-btn sms-invite-btn grey`}
            aria-label={t("COPY_TO_CLIPBOARD")}
            onClick={copyRoomLinkHandler}
            {...test("COPY_LINK_BUTTON")}
          >
            {t("COPY")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkTab;
