module.exports.VidyoConnector = require("./VidyoConnector");

module.exports.Stethoscope =
  process.env.REACT_APP_FEATURE_STETHOSCOPE_DISABLED !== "true"
    ? require("./Stethoscope")
    : {
        Global: () => null,
        SelectList: () => null,
        ControlPanel: () => null,
        ParticipantListMenuItem: () => null,
      };

module.exports.FullscreenToggle =
  process.env.REACT_APP_FEATURE_FULLSCREEN_DISABLED !== "true"
    ? require("./Fullscreen").Toggle
    : () => null;
