import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { stopWindowShare } from "store/actions/call";
import { Button, Classes } from "@blueprintjs/core";
import { useTranslation } from "react-i18next";
import "./Button.scss";

const EndShareButton = () => {
  const selectedShare = useSelector((state) => state.call.selectedShare);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleEndShare = () => {
    dispatch(stopWindowShare());
  };

  if (!selectedShare) {
    return null;
  }

  return (
    <div className="end-share-button">
      <Button
        aria-label={t("END_SHARE")}
        className={Classes.INTENT_DANGER}
        onClick={handleEndShare}
      >
        {t("END_SHARE")}
      </Button>
    </div>
  );
};

export default EndShareButton;
