import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import RouterComponent from "./router";
import logger from "utils/logger";
import store from "./store";
import {
  diactivateTab,
  updateNetworkConnectionStatus,
} from "store/actions/app";
import { updateAvailableResources } from "store/actions/call";
import { isBackgroundEffectSupported } from "utils/useBackgroundEffect";
import runMultipleTabsDetection from "utils/multipleTabsDetection";
import {
  isIOS,
  isMobileSafari,
  deviceDetect,
  isSafari,
  isMobile,
} from "react-device-detect";
import { Stethoscope } from "features";
import storage from "./utils/storage";

import "./translations/i18n";
import "./styles/index.scss";
import OperatingSystemInfoProvider from "utils/deviceDetect";

import { FocusStyleManager } from "@blueprintjs/core";
FocusStyleManager.onlyShowFocusOnTabs();

const environment = deviceDetect();
window.isSafariBrowser = isSafari; // for banuba plugin only
window.isMobileOrTablet =
  isMobile || OperatingSystemInfoProvider.IsTabletDevice(); // for banuba plugin

logger.warn(`App version is ${window.appConfig.APP_VERSION}`);
logger.warn({ environment });
logger.warn(
  `Is device tablet = ${OperatingSystemInfoProvider.IsTabletDevice()}`
);

if (process.env.NODE_ENV !== "production") {
  logger.warn("not in production mode");
}

window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    window.scroll(0, 1);
  }, 500);
});
window.addEventListener("resize", () => {
  setTimeout(() => {
    window.scroll(0, 1);
  }, 500);
});

if (
  isBackgroundEffectSupported &&
  (!window.isMobileOrTablet ||
    (window.isMobileOrTablet && storage.getItem("selectedCameraEffect")))
) {
  const params = new URLSearchParams(window.location.search);
  const urlInitializeWebView = params.get("initializeWebView");
  if (!urlInitializeWebView) {
    window.addEventListener("load", () => {
      import("./banuba/BanubaPlugin").then((banubaPlugin) => {
        banubaPlugin.initBanubaPlugin();
      });
    });
    window.banubaIsLoaded = true;
  }
}

function calcMobileWinSize() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--windowHeight", `${vh}px`);
}
if (isMobileSafari && isIOS) {
  document.body.classList.add("ios-safari");
  window.addEventListener("load", calcMobileWinSize);
  window.addEventListener("resize", calcMobileWinSize);
}

runMultipleTabsDetection({
  storagePrefix: process.env.REACT_APP_NAME.toLowerCase(),
  onPageAdded() {
    logger.error("New page added");
    store.dispatch(diactivateTab());
  },
}).then(() => {
  logger.info("runMultipleTabsDetection started");
});

// just for testing
window.availableResourcesChange = (
  cpuEncode,
  cpuDecode,
  bandwidthSend,
  bandwidthReceive
) => {
  store.dispatch(
    updateAvailableResources({
      cpuEncode,
      cpuDecode,
      bandwidthSend,
      bandwidthReceive,
    })
  );
};

window.addEventListener("offline", (e) => {
  console.log("updateNetworkConnectionStatus offline ", e);
  store.dispatch(updateNetworkConnectionStatus(false));
});

window.addEventListener("online", (e) => {
  console.log("updateNetworkConnectionStatus online ", e);
  store.dispatch(updateNetworkConnectionStatus(true));
});

const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <RouterComponent />
    <Stethoscope.Global />
  </Provider>
);
