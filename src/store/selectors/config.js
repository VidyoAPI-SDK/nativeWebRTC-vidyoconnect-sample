export const getIsWebViewEnabled = (state) =>
  state.config.urlInitializeWebView.value;
export const getLeftPaneltoggle = (state) => state.config.urlLeftPanel.value;
export const getCustomParameters = (state) => state.config.customParameters;
export const getUrlChatIsDefault = (state) => state.config.urlChat.isDefault;
export const getUrlChatValue = (state) => state.config.urlChat.value;
export const getShareButtonToggleValue = (state) => state.config.urlShare.value;
