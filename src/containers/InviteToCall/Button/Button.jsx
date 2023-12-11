import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { test } from "utils/helpers";
import "./Button.scss";
import * as googleAnalytics from "store/actions/googleAnalytics";
import hotkeys from "hotkeys-js";
import { getShortcutKeys, keyShortcutsLog } from "utils/keyboardShortcuts";

const InviteToCallButton = (props) => {
  const onClick = props.onClick || null;
  const dispatch = useDispatch();
  useEffect(() => {
    hotkeys.filter = function () {
      return true;
    };
    hotkeys(getShortcutKeys().TOOGLE_INVITE_PANEL, (e, handler) => {
      e.preventDefault();
      onClick();
      keyShortcutsLog(`Key pressed - ${handler.key}`);
      dispatch(googleAnalytics.keyboardShortcuts("OPEN_INVITE_PANEL"));
    });
    return () => {
      hotkeys.unbind(getShortcutKeys().TOOGLE_INVITE_PANEL);
    };
  }, [dispatch, onClick]);

  return (
    <button
      aria-label={props["aria-label"]}
      className="invite-to-call-button"
      {...test("INVITE_TO_CALL")}
      onClick={onClick}
    ></button>
  );
};

export default InviteToCallButton;
