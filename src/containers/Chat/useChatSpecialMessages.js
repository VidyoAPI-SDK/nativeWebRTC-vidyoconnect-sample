import { useEffect } from "react";
import { useSelector } from "react-redux";
import hunterChat from "utils/hunterChat";
import showNotification from "components/Notifications";
import { getFormattedString } from "utils/helpers";

export default function useChatSpecialMessages(currentUser, participants, t) {
  const { specialMessage: chatSpecialMessage } = useSelector(
    (state) => state.chat
  );

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
}
