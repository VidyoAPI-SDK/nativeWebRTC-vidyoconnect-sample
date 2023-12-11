import React from "react";
import { isMobile as isMobileDevice, isAndroid } from "react-device-detect";
import { useSelector, useDispatch } from "react-redux";
import { startWindowShare } from "store/actions/call";
import { test } from "utils/helpers";
import { Classes } from "@blueprintjs/core";
import "./Button.scss";
import { t } from "i18next";

const ShareButton = ({ label = "" }) => {
  const localWindowShares = useSelector(
    (state) => state.call.localWindowShares
  );

  const shareButtonToggle = useSelector((state) => state.config.urlShare.value);

  const dispatch = useDispatch();

  const handleStartShare = () => {
    const windowShare = localWindowShares[0];
    if (windowShare) {
      dispatch(startWindowShare(windowShare));
    }
  };

  if (isMobileDevice || isAndroid || !shareButtonToggle) {
    return null;
  }

  return (
    <div className={"share-button-container " + Classes.POPOVER_DISMISS}>
      <button
        aria-label={t("SHARE_APPLICATIONS")}
        className="share-button"
        {...test("SHARE_BUTTON")}
        onClick={handleStartShare}
      ></button>
      {label && <span onClick={handleStartShare}>{label}</span>}
    </div>
  );
};

export default ShareButton;
