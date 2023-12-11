import React, { useRef } from "react";
import "./html-energy-level.js";
import "./EnergyLevel.scss";

const EnergyLevel = ({ microphoneId, asIcon, isDisabled }) => {
  const energyLevelComponent = useRef(null);
  const energyLevelComponentType = asIcon ? (
    <icon-microphone-energy-level
      ref={energyLevelComponent}
      debug="false"
      microphone={microphoneId}
      disabled={isDisabled}
    ></icon-microphone-energy-level>
  ) : (
    <microphone-energy-level
      ref={energyLevelComponent}
      debug="false"
      microphone={microphoneId}
      disabled={isDisabled}
    ></microphone-energy-level>
  );

  return energyLevelComponentType;
};

export default React.memo(EnergyLevel);
