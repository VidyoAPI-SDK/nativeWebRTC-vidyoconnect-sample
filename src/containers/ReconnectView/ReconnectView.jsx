import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getFormattedString } from "utils/helpers";
import { endCall } from "store/actions/call";

import "./ReconnectView.scss";

const ReconnectView = () => {
  const dispatch = useDispatch();
  const networkConnectionStatus = useSelector(
    (state) => state.app.networkConnectionStatus
  );
  const callReconnecting = useSelector(
    (state) => state.app.callReconnecting
  );
  const { t } = useTranslation();

  if (!networkConnectionStatus || callReconnecting) {
    return (
      <div className="reconnect-view-container">
        <div className="message" dangerouslySetInnerHTML={{
          __html: getFormattedString(
            t("YOU_WERE_DISCONNECTED"),
            "<br/>"
          ),
        }}>
        </div>
        <div className="reconnect-spinner">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
        <div>
          <div className="leave-button uppercase-translation-text"
            onClick={() => {
              dispatch(endCall());
            }}
          >{t("LEAVE_THE_CALL")}</div>
        </div>
      </div>
    );
  }
  else {
    return null;
  }
};

export default ReconnectView;
