import React from "react";
import MicrophoneToggle from "./toggles/MicrophoneToggle";
import SpeakerToggle from "./toggles/SpeakerToggle";
import CameraToggle from "./toggles/CameraToggle";
import SelfView from "containers/SelfView";
import FlipCameraButton from "containers/FlipCameraButton";
import { Position } from "@blueprintjs/core";
import "./QuickMediaSettings.scss";

const QuickMediaSettings = ({ deviceMenuStyle }) => {
  return (
    <div className="quick-media-settings">
      <SelfView externalControls={<FlipCameraButton />} />
      <div className="media-devices">
        <SpeakerToggle
          showLabel={true}
          showTestSound={true}
          tooltipPosition={Position.TOP}
          deviceMenuStyle={deviceMenuStyle}
        />
        <MicrophoneToggle
          showLabel={true}
          tooltipPosition={Position.TOP}
          deviceMenuStyle={deviceMenuStyle}
        />
        <CameraToggle
          showLabel={true}
          tooltipPosition={Position.TOP}
          deviceMenuStyle={deviceMenuStyle}
        />
      </div>
    </div>
  );
};

export default React.memo(QuickMediaSettings);
