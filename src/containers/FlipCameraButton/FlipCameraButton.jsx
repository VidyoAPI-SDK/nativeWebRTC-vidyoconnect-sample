import { t } from "i18next";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { cycleCamera } from "store/actions/devices";

import "./FlipCameraButton.scss";

const FlipCameraButton = (props) => {
  const dispatch = useDispatch();
  const cameraMuteControlToggle = useSelector(
    (state) => state.config.urlCameraMuteControl.value
  );
  const devices = useSelector((state) => state.devices);

  const onClick = () => {
    dispatch(cycleCamera());
  };

  if (!cameraMuteControlToggle) {
    return null;
  }

  return (
    <button
      aria-label={t("FLIP_CAMERA")}
      className="flip-camera-button"
      onClick={onClick}
      disabled={!devices.isCameraTurnedOn}
    ></button>
  );
};

export default FlipCameraButton;
