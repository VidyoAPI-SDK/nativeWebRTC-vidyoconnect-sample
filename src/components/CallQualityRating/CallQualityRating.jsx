import React, { useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useTranslation } from "react-i18next";
import { Dialog as BlueprintDialog, Classes, Button } from "@blueprintjs/core";
import { useMobileDimension, useOrientation } from "utils/hooks";
import { Rating } from "react-simple-star-rating";
import * as googleAnalytics from "store/actions/googleAnalytics";
import imgLog from "../../assets/images/logos/logo.svg";
import "./CallQualityRating.scss";

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(googleAnalytics, dispatch),
});
const CallQualityRating = ({ isOpen, onCancel, callQualityFeedback }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const handleRating = (rate) => {
    setRating(rate);
  };
  const onSubmitHandle = () => {
    callQualityFeedback(rating / 20);
    setTimeout(() => {
      onCancel();
    }, 1000);
  };
  const [isMobileDimension] = useMobileDimension();
  const [orientation] = useOrientation();
  const ratingSize = isMobileDimension ? 25 : 40;
  const getClassName = () => {
    let className = "blueprint-dialog";
    if (isMobileDimension) className += " mobile";
    if (orientation) className += " " + orientation;
    return className;
  };

  return (
    <BlueprintDialog
      isOpen={isOpen}
      onClose={onCancel}
      canOutsideClickClose={false}
      portalClassName={getClassName()}
    >
      <div className={Classes.DIALOG_BODY}>
        <p>
          {" "}
          <img alt="logo" className="logo" src={imgLog} />
        </p>
        <p>
          <span className="thanks-msg">{t("THANKS_FOR_USING_VIDYO")}</span>
          <span>{t("PLEASE_LET_US_KNOW_HOW_THE_CALL_WENT")}</span>
        </p>
        <p>
          <Rating
            allowHover={false}
            showTooltip={false}
            size={ratingSize}
            onClick={handleRating}
            ratingValue={rating}
          />
        </p>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              disabled={rating === 0}
              className="bp4-intent-green"
              onClick={onSubmitHandle}
            >
              {t("SUBMIT")}
            </Button>
            <Button className="txt-button" onClick={onCancel}>
              {t("SKIP")}
            </Button>
          </div>
        </div>
      </div>
    </BlueprintDialog>
  );
};

export default connect(null, mapDispatchToProps)(CallQualityRating);
