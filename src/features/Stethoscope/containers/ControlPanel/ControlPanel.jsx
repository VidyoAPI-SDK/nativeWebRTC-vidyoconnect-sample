import React from "react";
import { useDispatch, useSelector } from "react-redux";
import StethoscopeIcon from "assets/images/buttons/control-stethoscope.svg";
import StethoscopeOffIcon from "assets/images/buttons/control-stethoscope-off.svg";
import FloatingPanel from "components/FloatingPanel";
import { test } from "utils/helpers";
import {
  unselectRemoteStethoscope,
  startRemoteStethoscope,
  stopRemoteStethoscope,
} from "../../actions/creators";
import { useTranslation } from "react-i18next";
import "./ControlPanel.scss";

const ControlPanel = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { selectedRemoteStethoscope, isRemoteStethoscopeStarted } = useSelector(
    (state) => state.feature_stethoscope
  );

  if (!selectedRemoteStethoscope) {
    return null;
  }

  const onClick = () => {
    if (isRemoteStethoscopeStarted) {
      dispatch(stopRemoteStethoscope());
    } else {
      dispatch(startRemoteStethoscope(selectedRemoteStethoscope));
    }
  };

  const onClose = () => {
    dispatch(unselectRemoteStethoscope());
  };

  return (
    <FloatingPanel
      title={selectedRemoteStethoscope.participant.name}
      isMinimizable={false}
      className="stethoscope-panel"
      onClose={onClose}
      content={
        <img
          alt={t("STETHOSCOPE")}
          src={
            isRemoteStethoscopeStarted ? StethoscopeIcon : StethoscopeOffIcon
          }
          onClick={onClick}
          height={36}
        />
      }
      {...test("STETHOSCOPE_PANEL")}
    />
  );
};

export default ControlPanel;
