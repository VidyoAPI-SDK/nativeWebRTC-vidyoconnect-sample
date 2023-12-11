import showNotification from "components/Notifications/Notifications";
import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { lockRoomRequest } from "services/SoapAPIProvider/soapAPIRequests/lockRoom";
import { unLockRoom } from "store/actions/call";
import { test } from "utils/helpers.js";
import roomUnlockedIcon from "assets/images/status/unlocked.svg";
import "./RoomLocked.scss";

export const RoomLocked = ({ portal, authToken, roomID }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const unlockRoomClickHandler = () => {
    lockRoomRequest({
      portal,
      token: authToken,
      roomID,
      lockRoom: false,
    }).then((res) => {
      if (res?.Envelope?.Body?.UnlockRoomResponse?.OK === "OK") {
        dispatch(unLockRoom());
        showNotification("banner", {
          message: t("THE_ROOM_IS_NOW_UNLOCKED"),
          icon: roomUnlockedIcon,
        });
      }
    });
  };

  return (
    <div className="inv-room-locked" {...test("INITE_TO_CALL_LOCKED_ROOM")}>
      <div className="inv-unlock-icon"></div>
      <p id="inv-unlock-m-1">{t("INVITATION_ROOM_LOCKED_MESSAGE")}</p>
      <p id="inv-unlock-m-2">{t("INVITATION_ROOM_UNLOCK_MESSAGE")}</p>
      <div className="inv-room-locked-button">
        <button
          id="unlock-btn"
          aria-labelledby="inv-unlock-m-1 inv-unlock-m-2 unlock-btn"
          className={`invite-btn sms-invite-btn`}
          onClick={unlockRoomClickHandler}
          {...test("INVITE_CALL_UNLOCK_ROOM_BUTTON")}
        >
          {t("UNLOCK")}
        </button>
      </div>
    </div>
  );
};
