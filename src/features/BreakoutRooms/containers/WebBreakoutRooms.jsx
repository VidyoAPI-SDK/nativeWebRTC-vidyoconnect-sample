/* eslint-disable no-unused-vars */
import React, { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getFormattedString } from "utils/helpers";
import { Logger } from "utils/logger";
import {
  setIsRaiseHandButtonActive,
  setIsRoomBreakout,
  setIsShowAfterMovingNotification,
  setIsShowBreakoutLeftDialog,
  setMainRoomId,
  setMainRoomName,
  transferFailed,
  transferFinished,
  transferStarted,
} from "../actions/creators";
import Alert from "components/Alert/Alert";
import showNotification, {
  dismissNotification,
} from "components/Notifications/Notifications";
import Spinner from "components/Spinner/Spinner";
import "./WebBreakoutRooms.scss";
import Dialog from "components/Dialog";
import { endCall } from "store/actions/call";
import BreakoutRoomsProvider from "../providers/BreakoutRoomsProvider";
import * as googleAnalytics from "store/actions/googleAnalytics";
import useSoundNotifications from "utils/useSoundNotifications";
import { isMobileSafari, isSafari } from "react-device-detect";
import { resetInCallCustomParams } from "store/actions/config";

const brLogger = new Logger("BREAKOUT_ROOMS");
const broadcastNotifications = new Set();

const filterLogs = (output, ...rest) => {
  const logReplacer = (key, value) => {
    let newValue = value;
    switch (key) {
      case "moderatorPin":
        newValue = "value_hidden_for_logs";
        break;
      case "roomKey":
        newValue = value?.slice(0, -2) + "**";
        break;
      case "message":
        newValue = "value_hidden_for_logs";
        break;
      default:
        break;
    }
    return newValue;
  };

  return JSON.stringify(output, logReplacer, ...rest);
};

const clearBroadcastNotifications = () => {
  broadcastNotifications.forEach((n) => {
    dismissNotification(n);
  });
};

const WebBreakoutRooms = () => {
  const { t } = useTranslation();
  const [isShowMovingPopupPermitted, setIsShowMovingPopupPermitted] =
    useState(true);
  const afterMoveNotification = useRef();
  const dispatch = useDispatch();
  const call = useSelector((state) => state.call);
  const breakoutRooms = useSelector((state) => state.feature_breakoutRooms);
  const { incomingParticipantSound } = useSoundNotifications();

  useEffect(() => {
    brLogger.logInfo(
      `Feature inited for roomd id=${call.properties?.conferenceId}`
    );

    dispatch(setMainRoomId(call.properties?.conferenceId));
    dispatch(setMainRoomName(call.properties?.callName));

    const handleBroadcastMessage = (msg) => {
      try {
        brLogger.logInfo(`Broadcast message info: ${filterLogs(msg)}`);
        const roomMessage = msg?.message;
        const senderDisplayName = msg?.senderDisplayName;
        if (!roomMessage) {
          throw new Error("No message");
        }

        const notification = showNotification("bannerWithBtns", {
          type: "banner",
          className: "broadcast-notification",
          showFor: -1,
          header: `${t("BROADCAST_MESSAGE_FROM")} ${senderDisplayName}`,
          message: roomMessage,
          parseLinks: true,
          buttons: [
            {
              text: `${t("DISMISS")}`,
              callBack: () => {
                dismissNotification(notification);
                broadcastNotifications.delete(notification);
              },
            },
          ],
        });
        broadcastNotifications.add(notification);
      } catch (error) {
        brLogger.logError(`Error while handle broadcast message: ${error}`);
      }
    };

    const onTransfering = () => {
      dispatch(setIsShowBreakoutLeftDialog(false));
      clearBroadcastNotifications();
      dispatch(transferStarted());
      dispatch(googleAnalytics.breakoutRoom("Call Transfer"));
    };

    const onTransfered = () => {
      dispatch(resetInCallCustomParams());
      dispatch(transferFinished());
      setIsShowMovingPopupPermitted(true);
    };

    const onTransferFailed = (message) => {
      brLogger.logError(`ERROR during call transfer: ${message}.`);
      dispatch(transferFailed());
    };

    BreakoutRoomsProvider.subscibeOnCallTransfer(
      onTransfering,
      onTransfered,
      onTransferFailed
    );

    BreakoutRoomsProvider.subscribeOnBroadcastMessages(handleBroadcastMessage);

    return () => {
      brLogger.log("Component unmounted");
      dispatch(setIsRaiseHandButtonActive(false));
      dispatch(setIsRoomBreakout(false));
      dismissNotification(afterMoveNotification.current);
      clearBroadcastNotifications();
      broadcastNotifications.clear();
      dispatch(setIsShowAfterMovingNotification(false));
      dispatch(setIsShowBreakoutLeftDialog(false));
      dispatch(setMainRoomName(""));
      dispatch(setMainRoomId(""));
      BreakoutRoomsProvider.unsubscribeFromBroadcastMessages();
      BreakoutRoomsProvider.unsubscibeFromCallTransfer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      breakoutRooms.isShowAfterMovingNotification &&
      call.properties?.callName
    ) {
      dismissNotification(afterMoveNotification.current);
      afterMoveNotification.current = showNotification("bannerWithBtns", {
        type: "banner",
        className: "hardware-success",
        showFor: 10000,
        message: getFormattedString(
          t("YOU_HAVE_BEEN_MOVED_TO"),
          call.properties?.callName
        ),
        buttons: [
          {
            autoClickAfterNSeconds: 10,
            text: `${t("HIDE")}`,
            callBack: () => {
              dispatch(setIsShowAfterMovingNotification(false));
              afterMoveNotification.current = null;
            },
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    breakoutRooms.isShowAfterMovingNotification,
    call.properties?.callName,
    dispatch,
  ]);

  useEffect(() => {
    if (breakoutRooms.isTransferInProgress && !isMobileSafari) {
      try {
        incomingParticipantSound?.play?.();
      } catch (e) {
        console.error("Error while playing incomingParticipantSound", e);
      }
    }
  }, [breakoutRooms.isTransferInProgress, incomingParticipantSound]);

  const leftDialogButtons = [
    {
      title: t("CANCEL"),
      onClick: () => {
        dispatch(setIsShowBreakoutLeftDialog(false));
        dispatch(googleAnalytics.breakoutRoomClick("Cancel End Conference"));
      },
    },
    {
      title: t("EXIT_ROOM"),
      onClick: async () => {
        try {
          brLogger.logInfo("Left dialog EXIT_ROOM clicked");
          clearBroadcastNotifications();
          dispatch(googleAnalytics.breakoutRoomClick("Exit Conference"));
          await BreakoutRoomsProvider.comeBackToMainRoom();
        } catch (error) {
          brLogger.logError(`Error while exit breakout room: ${error}`);
        } finally {
          dispatch(setIsShowBreakoutLeftDialog(false));
        }
      },
    },
    {
      title: t("END_CONFERENCE"),
      onClick: () => {
        brLogger.logInfo("Left dialog END_CONFERENCE clicked");
        dispatch(setIsShowBreakoutLeftDialog(false));
        dispatch(endCall());
        dispatch(googleAnalytics.breakoutRoomClick("End Conference"));
      },
      className: "danger",
    },
  ];

  return (
    <>
      <Alert
        isOpen={
          breakoutRooms.isTransferInProgress && isShowMovingPopupPermitted
        }
        className="br-transfer-dialog"
        canEscapeKeyCancel={true}
        onCancel={() => {
          brLogger.logError("Hide call transfer popup by presing ESC");
          setIsShowMovingPopupPermitted(false);
        }}
        message={{
          header: t("YOU_ARE_MOVING_TO_ROOM"),
          text: <Spinner bubbles={false} />,
        }}
      />
      {breakoutRooms.isShowLeftDialog && (
        <Dialog
          isOpen={true}
          content={{
            html: t("END_CONFERENCE_INFO"),
          }}
          header={t("END_CONFERENCE")}
          buttons={leftDialogButtons}
          shouldReturnFocusOnClose={false}
        />
      )}
    </>
  );
};

export default memo(WebBreakoutRooms);
