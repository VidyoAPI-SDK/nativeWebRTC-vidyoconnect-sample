import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { test } from "utils/helpers";
import { Classes } from "@blueprintjs/core";
import { useTranslation } from "react-i18next";
import hotkeys from "hotkeys-js";
import { getShortcutKeys, keyShortcutsLog } from "utils/keyboardShortcuts";
import * as googleAnalytics from "store/actions/googleAnalytics";
import {
  updateReadMessageCount,
  setUnreadMessageCount,
} from "./../../../store/actions/chat";
import "./Toggle.scss";

const Toggle = ({ isChatOpen, onClick, label }) => {
  const historyLength = useSelector((state) => state.chat.history.length);
  const chatButtonToggle = useSelector((state) =>
    state.config.urlChat.isDefault
      ? state.config.portalFeatures?.["EndpointPublicChat"]
      : state.config.urlChat.value
  );
  const unreadMessageCount = useSelector(
    (state) => state.chat.unreadMessageCount
  );
  const readMessageCount = useSelector((state) => state.chat.readMessageCount);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  hotkeys.filter = function (event) {
    return true;
  };

  useEffect(() => {
    hotkeys(getShortcutKeys().TOOGLE_CHAT_PANEL, (e, handler) => {
      e.preventDefault();
      onClick();
      keyShortcutsLog(`Key pressed - ${handler.key}`);
      dispatch(googleAnalytics.keyboardShortcuts("TOOGLE_CHAT_PANEL"));
    });
    return () => {
      hotkeys.unbind(getShortcutKeys().TOOGLE_CHAT_PANEL);
    };
  }, [onClick, dispatch]);

  useEffect(() => {
    if (isChatOpen) {
      dispatch(setUnreadMessageCount(0));
      dispatch(updateReadMessageCount(historyLength));
    } else {
      if (historyLength) {
        dispatch(setUnreadMessageCount(historyLength - readMessageCount));
      } else {
        dispatch(setUnreadMessageCount(0));
        dispatch(updateReadMessageCount(0));
      }
    }
  }, [isChatOpen, historyLength, readMessageCount, dispatch]);

  if (!chatButtonToggle) {
    return null;
  }

  return (
    <div className={"chat-button-container " + Classes.POPOVER_DISMISS}>
      <button
        aria-label={`${t("CHAT")} ${t("TOGGLE")}`}
        aria-expanded={isChatOpen ? "true" : "false"}
        className={`chat-toggle${isChatOpen ? " active" : ""}`}
        {...test("CHAT_BUTTON")}
        onClick={onClick}
      >
        {unreadMessageCount && !label ? (
          <div
            role="alert"
            aria-live="polite"
            aria-relevant="all"
            tabIndex="-1"
            aria-label={t("UREAD_MESSAGES") + " " + unreadMessageCount}
            className="unread-message-counter"
          >
            <span aria-hidden>
              {unreadMessageCount < 10 ? unreadMessageCount : "9+"}
            </span>
          </div>
        ) : null}
      </button>
      {label && <span onClick={onClick}>{label}</span>}
      {unreadMessageCount && label ? (
        <div
          role="alert"
          aria-live="polite"
          aria-relevant="all"
          tabIndex="-1"
          aria-label={t("UREAD_MESSAGES") + " " + unreadMessageCount}
          className="unread-message-counter"
        >
          <span aria-hidden>
            {unreadMessageCount < 10 ? unreadMessageCount : "9+"}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default Toggle;
