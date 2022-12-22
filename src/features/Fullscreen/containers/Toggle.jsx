import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Classes } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";
import { isIOS, isTablet } from "react-device-detect";
import { setFullscreen } from "../actions/creators";

export const LABEL = "ENABLE_FULLSCREEN";

export default (props) => {
  const { isEnabled } = useSelector((state) => state.feature_fullscreen);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const toggleFullscreen = useCallback(() => {
    dispatch(setFullscreen(!isEnabled));
  }, [dispatch, isEnabled]);

  /**
   * Fullscreen feature only available on iPad, not on iPhone
   */
  if (isIOS && !isTablet) {
    return null;
  }

  return (
    <div className={props.className}>
      <Checkbox
        checked={isEnabled}
        onChange={toggleFullscreen}
        className={Classes.INTENT_SUCCESS}
        label={t(LABEL)}
      />
    </div>
  );
};
