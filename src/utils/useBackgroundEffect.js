import { useState, useEffect } from "react";
import storage from "utils/storage";
import OperatingSystemInfoProvider from "utils/deviceDetect";
import { isMobile as isMobileDevice } from "react-device-detect";

const params = new URLSearchParams(window.location.search);
const effectParam =
  params.get("blur") || window.appConfig.REACT_APP_BACKGROUND_EFFECT_ENABLED;

export default function useBackgroundEffect() {
  const [backgroundEffectAvailable, setBackgroundEffectAvailable] = useState(
    window.banubaPluginReady
  );

  useEffect(() => {
    const onBanubaPluginReady = () => {
      setBackgroundEffectAvailable(true);
    };
    window.addEventListener("BanubaPluginReady", onBanubaPluginReady, false);
    return () => {
      window.removeEventListener("BanubaPluginReady", onBanubaPluginReady);
    };
  }, [setBackgroundEffectAvailable]);

  return [backgroundEffectAvailable];
}

// export const isBackgroundEffectSupported = blurParam && isChrome && !isMobile;
export const isBackgroundEffectSupported = effectParam;

export const aplplyDefaultPortalEffect = (
  customParams,
  isWebViewEnabled,
  isUserAuthorizedValue
) => {
  if (!customParams || isWebViewEnabled || !isBackgroundEffectSupported) return;
  const backgroundEffectDisabledByUser = storage.getItem("clearCameraEffect");
  const customParamList =
    customParams?.[isUserAuthorizedValue ? "registered" : "unregistered"];
  let defaultPortalBackground = customParamList
    ? customParamList.DefaultCameraEffect
    : "";
  if (
    !["BLUR", "NONE"].includes(defaultPortalBackground) &&
    (isMobileDevice || OperatingSystemInfoProvider.IsTabletDevice())
  ) {
    defaultPortalBackground = "";
  }
  const onChangePortalBackground = () => {
    window.banuba.aplplyDefaultPortalEffect(defaultPortalBackground, storage);
  };

  if (window.banubaPluginReady) {
    onChangePortalBackground();
  } else if (window.banubaIsLoaded) {
    window.addEventListener(
      "BanubaPluginReady",
      onChangePortalBackground,
      false
    );
  } else if (
    defaultPortalBackground &&
    defaultPortalBackground !== "NONE" &&
    !backgroundEffectDisabledByUser
  ) {
    import("../banuba/BanubaPlugin").then((banubaPlugin) => {
      banubaPlugin.initBanubaPlugin();
    });
    window.banubaIsLoaded = true;
    window.addEventListener(
      "BanubaPluginReady",
      onChangePortalBackground,
      false
    );
    if (defaultPortalBackground === "BLUR") {
      storage.addItem("selectedCameraEffect", { id: "blur" });
      storage.addItem("defaultPortalBackground", true);
    }
  }
};
