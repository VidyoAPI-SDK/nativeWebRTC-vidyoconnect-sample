import VidyoConnectorAPI from "./providers/VidyoConnectorAPI";

let selectedProvider = null;

export const getCallAPIProvider = () => {
  if (selectedProvider) {
    return selectedProvider;
  }

  let provider = window.appConfig.REACT_APP_CALL_API_PROVIDER;

  if (provider === "VidyoConnectorAPI") {
    selectedProvider = new VidyoConnectorAPI();
  }

  window.callProvider = selectedProvider;
  return selectedProvider;
};
