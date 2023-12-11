import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import MessageComposer from "./MessageComposer";
import { Button } from "@blueprintjs/core";
import History from "./History";
import { useTranslation } from "react-i18next";
import { isAndroid, isMobileSafari } from "react-device-detect";
import {
  updateReadMessageCount,
  setUnreadMessageCount,
} from "./../../store/actions/chat";
import "./Chat.scss";

const Chat = (props) => {
  const inputId = "chat-inpit-id";
  const { t } = useTranslation();
  const [showShadow, setShowShadow] = useState(false);
  const historyLength = useSelector((state) => state.chat.history.length);
  const dispatch = useDispatch();
  useEffect(() => {
    if (props.isChatOpen && !(isMobileSafari || isAndroid)) {
      document.getElementById(inputId)?.focus();
    }
  }, [props.isChatOpen]);

  const handleScroll = (event) => {
    if (event.currentTarget.scrollTop > 0) {
      setShowShadow(true);
    } else {
      setShowShadow(false);
    }
  };
  const closeChatPanel = () => {
    if (props.isChatOpen) {
      dispatch(setUnreadMessageCount(0));
      dispatch(updateReadMessageCount(historyLength));
    }
    props.toggleChat();
  };
  return (
    <section className={`chat ${props.isChatOpen ? "open" : ""}`}>
      <div className={"chat-header" + (showShadow ? " show-shadow" : "")}>
        <div className="chat-label">{t("CHAT")}</div>
        <Button
          aria-label={`${t("CHAT")} ${t("TOGGLE")}`}
          className="mobile-chat-toggle"
          onClick={closeChatPanel}
        />
      </div>
      <div
        aria-hidden={props.isChatOpen ? "false" : "true"}
        aria-live="polite"
        aria-relevant="additions text"
        className="chat-content"
      >
        <History scrollEvent={handleScroll} />
      </div>
      <div
        aria-hidden={props.isChatOpen ? "false" : "true"}
        className="chat-footer"
      >
        <MessageComposer {...props} inputId={inputId} />
      </div>
    </section>
  );
};

export default memo(Chat);
