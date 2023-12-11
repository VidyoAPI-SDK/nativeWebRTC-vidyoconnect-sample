import { useTranslation } from "react-i18next";
import { test } from "utils/helpers";

import "./InfoMsg.scss";
import React, { useEffect } from "react";
import { trapFocusInElement } from "utils/accessability";

const InfoMsg = ({ ...props }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const removeTrap = trapFocusInElement({
      elementId: "#info-msg-popup",
      elementSelectorToBeFocused: "#info-msg-popup",
      liveUpdateOfElementList: true,
      hideContentBeyondModal: true,
    });
    return removeTrap;
  }, []);

  return (
    <div
      id="info-msg-popup"
      aria-modal="true"
      className="confirm"
      {...test("SETTINGS_POPUP")}
    >
      <div tabIndex="0" className="header">
        {props.header}
      </div>
      <div tabIndex="0" className="content">
        <div className="message">{props.message}</div>
      </div>
      <div className="buttons">
        <div
          role="button"
          tabIndex="0"
          className="button grey"
          onClick={props.onClose}
          {...test("INFO_MSG_CLOSE_BUTTON")}
        >
          {t("CANCEL")}
        </div>
        <div
          role="button"
          tabIndex="0"
          className="button green"
          onClick={props.onAction}
          {...test("INFO_MSG_ACTION_BUTTON")}
        >
          {props.actionButtonText}
        </div>
      </div>
    </div>
  );
};

export default InfoMsg;
