const GlobalMessages =
    process.env.REACT_APP_VC_GLOBAL_MESSAGES_ENABLED === "true"
        ? require("./GlobalMessages").default
        : () => null;

const AdvancedSettings =
    process.env.REACT_APP_VC_ADVANCED_SETTIGS_DISABLED !== "true"
        ? require("./AdvancedSettings").default
        : () => null;

const GoogleAnalytics =
    process.env.REACT_APP_VC_GOOGLE_ANALYTICS_DISABLED !== "true"
        ? require("./GoogleAnalytics")
        : {
            Settings: () => null,
        };

const AdHocRoom =
    process.env.REACT_APP_VC_CREATE_ADHOC_ROOM_ENABLED === "true"
        ? require("./AdHocRoom")
        : {
            RoomLink: () => null,
            AdHocRoomInfoDialog: () => null,
        };

export { AdvancedSettings , GoogleAnalytics, GlobalMessages, AdHocRoom }