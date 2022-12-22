import React, { useState, useEffect } from "react";
import { Checkbox, Classes } from "@blueprintjs/core";
import useBackgroundEffect, {
  isBackgroundEffectSupported,
} from "utils/useBackgroundEffect";
import storage from "../../../utils/storage";
import { loadScript } from "../../../utils/loaders.js";
import { useSelector, useDispatch } from "react-redux";
import { cameraTurnOn, cameraTurnOff } from "store/actions/devices";

const BlurBGCheckbox = ({ t }) => {
  const [blurBackground, setBlurBackground] = useState(false);
  const [loadingBanubaPlugginInProgress, setLoadingBanubaPlugginInProgress] =
    useState(window.banubaIsLoaded && !window.banubaPluginReady);
  const [backgroundEffectAvailable] = useBackgroundEffect(); // We need it for the correct update loading state if we load the default effect from the portal

  useEffect(() => {
    if (storage.getItem("selectedCameraEffect")) {
      const storedEffect = storage.getItem("selectedCameraEffect");

      if (storedEffect.id === "blur") {
        setBlurBackground(true);
      } else {
        setBlurBackground(false);
      }
    }
  }, []);

  const selectedCamera = useSelector((state) => state.devices.selectedCamera);
  const isCameraTurnedOn = useSelector(
    (state) => state.devices.isCameraTurnedOn
  );
  const dispatch = useDispatch();

  const onChangeBlurBackground = async (event = {}) => {
    const isChecked = event.target.checked;
    if (
      isBackgroundEffectSupported &&
      !window.banubaIsLoaded &&
      isChecked &&
      !loadingBanubaPlugginInProgress
    ) {
      setLoadingBanubaPlugginInProgress(true);
      loadScript("./banuba/BanubaPlugin.js", true);
      window.banubaIsLoaded = true;
    }
    if (isChecked) {
      setBlurBackground(isChecked);
      storage.addItem("selectedCameraEffect", { id: "blur" });
      storage.removeItem("clearCameraEffect");
    } else {
      setBlurBackground(isChecked);
      storage.removeItem("selectedCameraEffect");
      storage.addItem("clearCameraEffect", true);
    }

    const applyBanubaEffect = async (event) => {
      setLoadingBanubaPlugginInProgress(false);
      if (storage.getItem("selectedCameraEffect")?.id === "blur") {
        const isBanubaInited = window.banuba?.isBanubaInited;
        // skip aplying effect after loading the lib, such as effect will be applying during lib loading according to storege selectedCameraEffect
        if (!event) await window.banuba.applyEffect("blur");
        if (!isBanubaInited || event) {
          if (selectedCamera && isCameraTurnedOn) {
            // reset local camera
            dispatch(cameraTurnOff({ selectedCamera }));
            setTimeout(() => {
              dispatch(cameraTurnOn({ selectedCamera }));
            }, 600);
          }
        }
      } else {
        window.banuba.clearEffect();
      }
    };

    if (window.banubaPluginReady) {
      applyBanubaEffect();
    } else if (window.banubaIsLoaded && !loadingBanubaPlugginInProgress) {
      window.addEventListener("BanubaPluginReady", applyBanubaEffect, false);
    }
    storage.removeItem("defaultPortalBackground");
  };

  return (
    <div className="checkbox-section blur-checkbox">
      {isBackgroundEffectSupported && (
        <Checkbox
          checked={blurBackground}
          onChange={onChangeBlurBackground}
          className={`${Classes.INTENT_SUCCESS}`}
          label={t("BLUR_BACKGROUND")}
        />
      )}
      {loadingBanubaPlugginInProgress &&
        isBackgroundEffectSupported &&
        !backgroundEffectAvailable && <span>({t("LOADING_BLUR_EFFECT")})</span>}
    </div>
  );
};

export default BlurBGCheckbox;
