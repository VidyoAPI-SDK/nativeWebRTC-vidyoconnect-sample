const { default: AboutTab } = require("./AboutTab");
const { default: GeneralTab } = require("./GeneralTab");
const { default: HelpTab } = require("./HelpTab");
const { default: MediaTab } = require("./MediaTab");

const AccountTab =
  process.env.REACT_APP_SETTINGS_ACCOUNT_TAB_DISABLED === "true"
    ? () => null
    : require("./AccountTab").default;

module.exports = {
  AboutTab,
  AccountTab,
  GeneralTab,
  HelpTab,
  MediaTab,
};
