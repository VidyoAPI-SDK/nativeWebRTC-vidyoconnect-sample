import React from "react";
import ControlButton from "./ControlButton";

const ControlsBlock = ({
  isPlaying,
  isMuted,
  setPlayingState,
  setMuteState,
  disableAudio,
  additionalClass,
}) => {
  return (
    <div className={"controls-block " + additionalClass}>
      {!disableAudio && (
        <ControlButton
          className={`mute-btn${isMuted ? " muted" : ""}`}
          changeState={() => setMuteState((prevState) => !prevState)}
        />
      )}
      <ControlButton
        className={`play-btn${isPlaying ? " playing" : ""}`}
        changeState={() => setPlayingState((prevState) => !prevState)}
      />
    </div>
  );
};

export default ControlsBlock;
