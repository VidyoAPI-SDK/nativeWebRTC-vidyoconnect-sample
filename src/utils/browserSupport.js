import {
  isSafari,
  isMobileSafari,
  isChrome,
  browserVersion,
  isIOS,
  isEdge,
  osVersion,
} from "react-device-detect";

const searchParams = new URLSearchParams(window.location.search);
const skipBrowserCheck = searchParams.get("skipBrowserCheck");

const supportedBrowsers = {
  desktop: {
    chrome: {
      minVersion: 60,
    },
    edge: {
      minVersion: 70,
    },
    safari: {
      minVersion: 14,
    },
  },
  ios: {
    safari: {
      minVersion: 14,
    },
  },
  android: {
    chrome: {
      minVersion: 60,
    },
  },
};
const currentVersion = parseInt(browserVersion, 10);
let browserNotSupported = true;

if (isMobileSafari) {
  browserNotSupported =
    currentVersion < supportedBrowsers.ios.safari.minVersion;
}

if (isSafari) {
  browserNotSupported =
    currentVersion < supportedBrowsers.desktop.safari.minVersion;
}

if (isChrome) {
  browserNotSupported =
    currentVersion < supportedBrowsers.desktop.chrome.minVersion;
}

if (isEdge) {
  browserNotSupported =
    currentVersion < supportedBrowsers.desktop.edge.minVersion;
}

if (isIOS && !isSafari) {
  browserNotSupported = true;
}

if (!navigator.mediaDevices) {
  browserNotSupported = true;
}

if (skipBrowserCheck === "true" || skipBrowserCheck === "1") {
  if (browserNotSupported) {
    console.warn(
      `Browser is not supported, but "skipBrowserCheck" parameter present in the URL`
    );
  }
  browserNotSupported = false;
}

const isIOS15 = isIOS && parseInt(osVersion, 10) >= 15;

export { browserNotSupported, isIOS15 };
