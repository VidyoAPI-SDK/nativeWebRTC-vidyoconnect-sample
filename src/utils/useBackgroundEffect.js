import { useState, useEffect } from "react";
// import { isChrome, isMobile } from "react-device-detect";

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
