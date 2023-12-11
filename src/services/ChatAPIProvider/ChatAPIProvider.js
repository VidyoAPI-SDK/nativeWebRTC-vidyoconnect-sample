import VidyoConnectorAPI from "./providers/VidyoConnectorAPI";
import VidyoEndpointDesktopAPI from "./providers/VidyoEndprointDesktopAPI";

let selectedProvider = null;

export const getChatAPIProvider = () => {
  if (selectedProvider) {
    return selectedProvider;
  }

  let provider = window.appConfig.REACT_APP_CHAT_API_PROVIDER;

  if (provider === "VidyoConnectorAPI") {
    selectedProvider = new VidyoConnectorAPI();
  } else if (provider === "VidyoEndpointDesktopAPI") {
    selectedProvider = new VidyoEndpointDesktopAPI();
  }

  window.chatProvider = selectedProvider;
  return selectedProvider;
};
