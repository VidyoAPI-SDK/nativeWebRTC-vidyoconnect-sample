import React, { useState, useEffect, useCallback } from "react";
import { Tooltip, Position, Classes } from "@blueprintjs/core";
import { useTranslation } from "react-i18next";
import { test } from "utils/helpers";

import "./CameraEffectsSelector.scss";

const CameraEffectsSelectorComponent = ({
  disabledReason,
  customEffects,
  predefinedEffects,
  selectedEffect,
  onEffectSelected,
  onEffectAdded,
  onEffectAddedError,
  onEffectRemoved,
}) => {
  const { t } = useTranslation();
  const [isErrorTooltipOpened, openErrorTooltip] = useState(false);

  // const showPlusButton = !customEffects.length;

  const wrapErrorTooltip = useCallback(
    (effectId, innerContent) => {
      if (
        disabledReason &&
        ((selectedEffect && selectedEffect.id) === effectId ||
          (!effectId && !selectedEffect))
      ) {
        return (
          <Tooltip
            position={Position.TOP}
            content={
              <span
                className="camera-effects-selector-error"
                {...test("EFFECT_ERROR")}
              >
                {disabledReason}
              </span>
            }
            isOpen={isErrorTooltipOpened}
            popoverClassName={Classes.INTENT_DANGER}
            key={`errorTooltip${effectId}`}
          >
            {innerContent}
          </Tooltip>
        );
      } else {
        return innerContent;
      }
    },
    [disabledReason, selectedEffect, isErrorTooltipOpened]
  );

  const handleMouseEvents = (event) => {
    event.stopPropagation();
    if (disabledReason) {
      openErrorTooltip(event.type === "mouseenter");
    }
  };

  useEffect(() => {
    if (disabledReason) {
      openErrorTooltip(true);
    } else {
      openErrorTooltip(false);
    }
  }, [disabledReason, openErrorTooltip]);

  useEffect(() => {
    let timeout = null;
    if (isErrorTooltipOpened) {
      timeout = setTimeout(() => openErrorTooltip(false), 5000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isErrorTooltipOpened, openErrorTooltip]);

  return (
    <div
      className={`camera-effects-selector-wrapper ${
        disabledReason ? "disabled" : ""
      }`}
      onMouseEnter={handleMouseEvents}
      onMouseLeave={handleMouseEvents}
    >
      <div className="camera-effects-selector-title">
        {t("SETTINGS_CUSTOMIZE_BACKGROUND_TITLE")}
      </div>
      <ul className="camera-effects-selector-list">
        {/* Clear effect */}
        {wrapErrorTooltip(
          null,
          <Tooltip
            position={Position.TOP}
            content={t("SETTINGS_CLEAR_BG_EFFECT")}
          >
            <li
              className="clear-effect"
              onClick={() => {
                onEffectSelected(null);
              }}
            />
          </Tooltip>
        )}
        {/* Blur background */}
        {wrapErrorTooltip(
          "blur",
          <Tooltip position={Position.TOP} content={t("BLUR_BACKGROUND")}>
            <li
              className={`blur-effect ${
                (selectedEffect && selectedEffect.id) === "blur"
                  ? "selected"
                  : ""
              }`}
              onClick={() => {
                onEffectSelected({ id: "blur" });
              }}
            />
          </Tooltip>
        )}

        {/* Predefined images */}
        {predefinedEffects.map((effect) => {
          return wrapErrorTooltip(
            effect.id,
            <Tooltip
              position={Position.TOP}
              content={effect.label}
              key={effect.id}
            >
              <li
                className={`predefined-effect ${
                  (selectedEffect && selectedEffect.id) === effect.id
                    ? "selected"
                    : ""
                }`}
                onClick={() => {
                  onEffectSelected(effect);
                }}
              >
                <img src={effect.preview} alt="" />
              </li>
            </Tooltip>
          );
        })}

        {/* For now disabled */}
        {/* // User uploaded images
        {customEffects.map((effect) => {
          return wrapErrorTooltip(
            effect.id,
            <Tooltip
              position={Position.TOP}
              content={effect.label}
              key={effect.id}
            >
              <li
                className={`custom-effect ${
                  (selectedEffect && selectedEffect.id) === effect.id
                    ? "selected"
                    : ""
                }`}
                onClick={() => {
                  onEffectSelected(effect);
                }}
              >
                <span
                  className="remove-custom-effect"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEffectRemoved(effect);
                  }}
                />
                <img src={effect.preview} alt="" />
              </li>
            </Tooltip>
          );
        })}
        // Add local image 
        {showPlusButton && (
          <Tooltip
            position={Position.TOP}
            content={t("SETTINGS_SELECT_LOCAL_IMAGE")}
          >
            <ImagePicker
              extensions={["jpg", "png", "jpeg"]}
              dims={{}}
              onChange={onEffectAdded}
              onError={onEffectAddedError}
            >
              <li className="add-custom-effect" />
            </ImagePicker>
          </Tooltip>
        )} */}
      </ul>
    </div>
  );
};

export default CameraEffectsSelectorComponent;
