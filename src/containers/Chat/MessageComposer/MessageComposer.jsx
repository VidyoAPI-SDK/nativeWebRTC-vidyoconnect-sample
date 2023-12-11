import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendChatMessage } from "store/actions/chat";
import {
  InputGroup,
  Button,
  Classes,
  Position,
  Tooltip,
} from "@blueprintjs/core";
import sendIcon from "assets/images/buttons/send.svg";
import sendIconActive from "assets/images/buttons/input_send_active.svg";
import { test } from "utils/helpers";
import { useTranslation } from "react-i18next";
import "./MessageComposer.scss";

const MAX_MESSSAGE_LENGTH = 1024;

const MessageComposer = ({ isChatOpen, inputId }) => {
  const [message, setMessage] = useState("");
  const [isOpenToolTip, setOpenToolTip] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const BREAKOUT_ROOM = useSelector((state) => state.feature_breakoutRooms);

  const onChange = (event) => {
    var newMessageLength = event.target.value.length;
    if (newMessageLength <= MAX_MESSSAGE_LENGTH) {
      setOpenToolTip(false);
      setMessage(event.target.value);
    } else {
      setOpenToolTip(true);
      let txtText = event.target.value.substring(0, MAX_MESSSAGE_LENGTH);
      setMessage(txtText);
    }
  };

  const onPaste = (event) => {
    let pasteText = (event.clipboardData || window.clipboardData).getData(
      "text"
    );
    var newMessageLength = pasteText.length;
    if (newMessageLength > MAX_MESSSAGE_LENGTH) {
      event.preventDefault();
      setOpenToolTip(true);
    }
  };

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      dispatch(sendChatMessage({ message: trimmedMessage }));
      setMessage("");
      setOpenToolTip(false);
      document.getElementById(inputId)?.focus();
    }
  };

  const onKeyDown = function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  useEffect(() => {
    if (
      !BREAKOUT_ROOM.isTransferInProgress &&
      BREAKOUT_ROOM.isShowAfterMovingNotification
    ) {
      setMessage("");
      setOpenToolTip(false);
    }
  }, [
    BREAKOUT_ROOM.isShowAfterMovingNotification,
    BREAKOUT_ROOM.isTransferInProgress,
  ]);

  useEffect(() => {
    if (!isChatOpen) {
      setOpenToolTip(false);
    }
  }, [isChatOpen]);

  return (
    <div className="message-composer">
      <Tooltip
        isOpen={isOpenToolTip}
        content={<span>{t("ENTER_LESS_CHARACTERS")}</span>}
        popoverClassName={Classes.INTENT_DANGER + " red-border"}
        position={Position.TOP}
      >
        <InputGroup
          {...test("CHAT_MESSAGE_INPUT")}
          value={message}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          id={inputId}
          aria-label={t("TYPE_YOUR_MESSAGE")}
          autoComplete="off"
          placeholder={t("TYPE_YOUR_MESSAGE") + "..."}
        />
      </Tooltip>
      <Button
        {...test("SEND_MESSAGE")}
        aria-label={t("SEND_MESSAGE")}
        disabled={!message}
        onClick={sendMessage}
        className="send-message"
        icon={
          <img
            src={!message ? sendIcon : sendIconActive}
            height={15}
            width={18}
            alt="icon"
          />
        }
      />
    </div>
  );
};

export default MessageComposer;
