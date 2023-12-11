import WebProvider from "./WebProvider";
import DesktopProvider from "./DesktopProvider";

let selectedProvider = null;

const appType = window.vidyoApp?.getMode?.() === 0 ? "DESKTOP" : "WEB";

const getClosedCaptioningProvider = () => {
  if (selectedProvider) {
    return selectedProvider;
  }
  switch (appType) {
    case "DESKTOP":
      selectedProvider = new DesktopProvider();
      break;

    case "WEB":
      selectedProvider = new WebProvider();
      break;

    default:
      selectedProvider = new WebProvider();
      break;
  }

  return selectedProvider;
};

export const ccProvider = getClosedCaptioningProvider();
