import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setFeccPresetsLabel,
  setFeccPresetsSelectLabel,
} from "store/actions/call";
import { useTranslation } from "react-i18next";

export const useFECC = (isWebViewEnabled) => {
  const { compositorTiles, feccOpen: isFeccOpen } = useSelector(
    (state) => state.call
  );

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const feccPanel = useRef();

  useEffect(() => {
    dispatch(setFeccPresetsLabel(t("CAMERA_PRESET")));
    dispatch(setFeccPresetsSelectLabel(t("SELECT_PRESET")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    compositorTiles.forEach(({ element }) => {
      let feccTooltip = element.querySelector(".js-fecc-tooltip");
      const feccButton = element.querySelector(
        ".tile-control.control-participant"
      );

      if (!feccTooltip) {
        if (
          !element.classList.contains("video-muted") &&
          !element.classList.contains("local-track")
        ) {
          if (feccButton) {
            feccTooltip = document.createElement("div");
            feccTooltip.classList.add(
              "vc-compositor-tooltip",
              "js-fecc-tooltip"
            );
            feccTooltip.textContent = t("ADJUST_CAMERA");
            feccButton.appendChild(feccTooltip);
          }
        }
      } else {
        feccTooltip.textContent = t("ADJUST_CAMERA");
      }
    });
  }, [compositorTiles, t]);

  useEffect(() => {
    /**
     * On small epic monitor sizes fecc panel overflows screen
     * workaround for setting compact view
     */
    const setCompactView = () => {
      if (feccPanel.current) {
        feccPanel.current.SetCompactView(true);
      }
    };

    if (isWebViewEnabled && isFeccOpen) {
      feccPanel.current = document.querySelector("fecc-controls-view");
      if (feccPanel.current) {
        setCompactView();
      } else {
        setTimeout(() => {
          feccPanel.current = document.querySelector("fecc-controls-view");
          setCompactView();
        }, 1000);
      }

      window.addEventListener("resize", setCompactView);
    } else {
      window.removeEventListener("resize", setCompactView);
      feccPanel.current = null;
    }

    return () => {
      window.removeEventListener("resize", setCompactView);
      feccPanel.current = null;
    };
  }, [isFeccOpen, isWebViewEnabled]);
};
