import React from "react";
import "./html-speaker-test-energy-level.js";

const SpeakerTestEnergyLevel = ({
  speakerId,
  playButtonId,
  labelId,
  isDisabled,
}) => {
  return (
    <icon-speaker-test-energy-level
      speaker_id={speakerId}
      play_btn_id={playButtonId}
      label_id={labelId}
      disabled={isDisabled}
    ></icon-speaker-test-energy-level>
  );
};

export default React.memo(SpeakerTestEnergyLevel);
