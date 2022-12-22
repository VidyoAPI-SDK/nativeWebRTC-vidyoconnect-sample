import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { cameraTurnOn, cameraTurnOff } from "store/actions/devices";
import storage from "../../utils/storage";
import useBackgroundEffect, {
  isBackgroundEffectSupported,
} from "utils/useBackgroundEffect";
import CameraEffectsSelectorComponent from "./CameraEffectsSelectorComponent";

const CameraEffectsSelector = ({ showSelfView }) => {
  const { t } = useTranslation();
  const [backgroundEffectAvailable] = useBackgroundEffect();
  const [customEffects, setCustomEffects] = useState([]);
  const [selectedEffect, selectEffect] = useState(null);

  const isCameraTurnedOn = useSelector(
    (state) => state.devices.isCameraTurnedOn
  );
  const selectedCamera = useSelector((state) => state.devices.selectedCamera);
  const dispatch = useDispatch();

  const predefinedEffects = [1, 2, 3, 4, 5, 6, 7].map((i) => {
    return {
      id: `predefinedImage${i}`,
      name: `camera_bg_${i}`,
      preview: `images/camera_bg_preview/camera_bg_${i}.jpg`,
      label: t(`CAMERA_BG_IMAGE_${i}`),
    };
  });

  useEffect(() => {
    if (storage.getItem("selectedCameraEffect")) {
      const storedEffect = storage.getItem("selectedCameraEffect");

      if (storedEffect.id === "blur") {
        selectEffect({ id: "blur" });
      } else {
        selectEffect(storedEffect);
      }
    } else {
      selectEffect(null);
    }
  }, []);

  const onEffectSelected = async (effect) => {
    if (effect) {
      console.warn(`Selected effect ${effect.id}`);
      storage.removeItem("clearCameraEffect");
      selectEffect(effect);
      const isBanubaInited = window.banuba?.isBanubaInited;
      if (effect.id === "blur") {
        storage.addItem("selectedCameraEffect", { id: "blur" });
        await window.banuba.applyEffect("blur");
      } else {
        storage.addItem("selectedCameraEffect", effect);
        await window.banuba.applyEffect(effect.name);
      }
      if (!isBanubaInited) {
        if (selectedCamera && isCameraTurnedOn) {
          // reset local camera
          dispatch(cameraTurnOff({ selectedCamera }));
          setTimeout(() => {
            dispatch(cameraTurnOn({ selectedCamera }));
          }, 600);
        } else {
          // reset self-view
          // TODO find better solution to change a strem in self-view, currunt solution cause seflviw short blink than shift UI
          showSelfView(false);
          setTimeout(() => showSelfView(true), 100);
        }
      }
    } else {
      console.warn(`Clear effect`);
      selectEffect(null);
      storage.addItem("clearCameraEffect", true);
      storage.removeItem("selectedCameraEffect");
      window.banuba.clearEffect();
    }
    storage.removeItem("defaultPortalBackground");
  };

  const onEffectAdded = (base64) => {
    let id = `customImage${new Date().valueOf()}`;
    console.warn(`Custom effect ${id} added`);
    let effect = {
      id,
      preview: base64,
      path: base64,
      label: "Uploaded by user",
    };
    setCustomEffects([...customEffects, effect]);
    selectEffect(effect);
    storage.removeItem("defaultPortalBackground");
  };

  const onEffectAddedError = (error) => {
    console.error("Custom effect was not added:", error);
  };

  const onEffectRemoved = (effect) => {
    console.warn(`Removed custom effect effect ${effect.id}`);
    setCustomEffects(customEffects.filter((e) => e.id !== effect.id));
    if (selectedEffect && selectedEffect.id === effect.id) {
      onEffectSelected(null);
    }
  };

  return (
    <React.Fragment>
      {backgroundEffectAvailable && (
        <CameraEffectsSelectorComponent
          disabledReason={""}
          customEffects={customEffects}
          predefinedEffects={predefinedEffects}
          selectedEffect={selectedEffect}
          onEffectSelected={onEffectSelected}
          onEffectAdded={onEffectAdded}
          onEffectAddedError={onEffectAddedError}
          onEffectRemoved={onEffectRemoved}
        />
      )}
      {!backgroundEffectAvailable && isBackgroundEffectSupported && (
        <span>{t("LOADING_BLUR_EFFECT")}</span>
      )}
    </React.Fragment>
  );
};

export default CameraEffectsSelector;
