import React from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { Position, Tooltip, Popover } from "@blueprintjs/core";
import { useIsTouchScreen } from "utils/hooks";
import "./RecorderStatus.scss";

const mapState = ({ call }, props) => {
  return {
    recorderOn: call.recorderOn,
  };
};

const RecorderStatus = ({ recorderOn }) => {
  const { t } = useTranslation();
  const isTouchScreen = useIsTouchScreen();
  return recorderOn ? (
    <Popover
      content={t("THE_CONFERENCE_IS_BEING_RECORDED")}
      position={Position.BOTTOM}
      popoverClassName="recorder-status-popupover"
      disabled={!isTouchScreen}
    >
      <Tooltip
        content={t("THE_CONFERENCE_IS_BEING_RECORDED")}
        position={Position.BOTTOM}
        portalClassName="device-tooltip"
      >
        <div
          tabIndex="0"
          role="alert"
          aria-label={t("THE_CONFERENCE_IS_BEING_RECORDED")}
          className="recorder-status-container"
        >
          <div className="recorder-status-icon active"></div>
        </div>
      </Tooltip>
    </Popover>
  ) : null;
};

export default connect(mapState, null)(RecorderStatus);
