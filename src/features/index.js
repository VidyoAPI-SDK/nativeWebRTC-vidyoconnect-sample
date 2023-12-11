import * as VidyoConnector from "./VidyoConnector";
import WebBreakoutRooms from "./BreakoutRooms";

const Stethoscope =
  process.env.REACT_APP_FEATURE_STETHOSCOPE_DISABLED !== "true"
    ? require("./Stethoscope")
    : {
        Global: () => null,
        SelectList: () => null,
        ControlPanel: () => null,
        ParticipantListMenuItem: () => null,
      };

const FullscreenToggle =
    process.env.REACT_APP_FEATURE_FULLSCREEN_DISABLED !== "true"
        ? require("./Fullscreen").Toggle
        : () => null;

export { VidyoConnector, Stethoscope, WebBreakoutRooms, FullscreenToggle };
