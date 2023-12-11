export const initializeWebView = (payload) => ({
  type: "WEBVIEW_INITIALIZE",
  payload,
});

export const getWebViewDevicesState = (payload) => ({
  type: "GET_WEBVIEW_STATE",
  payload,
});
