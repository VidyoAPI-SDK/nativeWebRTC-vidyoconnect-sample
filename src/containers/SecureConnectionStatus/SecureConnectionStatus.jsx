import React from "react";

import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tooltip, Position, Popover } from "@blueprintjs/core";
import { useIsTouchScreen } from "utils/hooks";
import { test } from "utils/helpers";
import "./SecureConnectionStatus.scss";

const connectionStatus = () => {
  return {
    secureConnection: true,
  };
};

const SecureConnectionStatus = ({ secureConnection }) => {
  const { t } = useTranslation();
  const isTouchScreen = useIsTouchScreen();
  return secureConnection ? (
    <div className="secure-status-wrap">
      <Popover
        content={t("THIS_CONFERENCE_IS_SECURE")}
        position={Position.BOTTOM}
        popoverClassName="secure-connection-status-popupover"
        disabled={!isTouchScreen}
      >
        <Tooltip
          content={t("THIS_CONFERENCE_IS_SECURE")}
          position={Position.BOTTOM}
          portalClassName="device-tooltip"
        >
          <div
            aria-label={t("THIS_CONFERENCE_IS_SECURE")}
            className="secure-status-container"
          >
            <div
              className="secure-status-icon"
              {...test("SECURE_CONNECTION_ICON")}
            ></div>
          </div>
        </Tooltip>
      </Popover>
    </div>
  ) : (
    <div className="secure-status-wrap">
      <Popover
        content={t("THIS_CONFERENCE_IS_NOT_SECURE")}
        position={Position.BOTTOM}
        disabled={!isTouchScreen}
      >
        <Tooltip
          content={t("THIS_CONFERENCE_IS_NOT_SECURE")}
          position={Position.BOTTOM}
          portalClassName="device-tooltip"
        >
          <div className="secure-status-container">
            <div
              className="secure-status-icon unsecure"
              {...test("UNSECURE_CONNECTION_ICON")}
            ></div>
          </div>
        </Tooltip>
      </Popover>
    </div>
  );
};

export default connect(connectionStatus, null)(SecureConnectionStatus);
