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
import { useEffect } from "react";
import { useRef } from "react";
import { getFormattedString } from "utils/helpers";
import { focusElementAndIgnoreFocusStyles } from "utils/accessability";
import { test } from "utils/helpers";

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
    callQualityFeedback(rating); // 1 star === 1 point
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
  let ratingContainer = useRef([]);
  useEffect(() => {
    window.setTimeout(() => {
      ratingContainer.current = Array.from(
        document.getElementsByClassName("react-simple-star-rating")
      );
      if (ratingContainer.current.length > 0) {
        ratingContainer.current[0].setAttribute("aria-hidden", "false");
        document
          .getElementsByClassName("filled-icons")[0]
          .setAttribute("aria-hidden", "true");
      }
    }, 200);
  }, []);

  const calculateCurrentPosition = (totalIcons, positionX, width) => {
    const singleHalfValue = 100 / totalIcons;
    const iconWidth = width / totalIcons;
    let currentValue = 100;
    for (let i = 0; i < totalIcons; i += 1) {
      // if position less then quarter icon
      if (positionX <= iconWidth * i + iconWidth / 4) {
        // if there is no value return 0
        if (i === 0 && positionX < iconWidth / 2) currentValue = 0;
        else currentValue = singleHalfValue * i;
        break;
      }
    }
    return currentValue;
  };

  const starIcon = (ariaText = "svg image") => {
    return (
      <svg
        // role={"button"}
        aria-label={ariaText}
        className={"star-svg"}
        tabIndex="0"
        role="button"
        onClick={(event) => {
          const { clientX } = event;
          const currentTarget = ratingContainer.current[0];
          // get main span element position and width
          const { left, width } =
            currentTarget.children[0].getBoundingClientRect();

          // set for RTL
          const positionX = clientX - left;
          const totalIcons = 5;
          // Get current pointer position while moves over the icons
          const currentValue = calculateCurrentPosition(
            totalIcons,
            positionX,
            width
          );
          document.getElementsByClassName("filled-icons")[0].style.width =
            currentValue + "%";
          setRating(currentValue / (100 / totalIcons)); // 1 star = 1 point
        }}
        stroke={"currentColor"}
        fill="currentColor"
        strokeWidth={0}
        viewBox="0 0 24 24"
        width={40}
        height={40}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
      </svg>
    );
  };

  useEffect(() => {
    return () =>
      focusElementAndIgnoreFocusStyles(
        document.querySelector("#guest-logout-message")
      );
  }, []);

  const onPopupOpened = () => {
    focusElementAndIgnoreFocusStyles(
      document.querySelector("#thanks-msg-quality-raiting")
    );
    setTimeout(() => {
      document
        .querySelectorAll('.filled-icons .star-svg[tabindex="0"]')
        ?.forEach(function (item) {
          item?.removeAttribute?.("tabindex");
        });
    });
  };

  return (
    <BlueprintDialog
      isOpen={isOpen}
      onClose={onCancel}
      canOutsideClickClose={false}
      portalClassName={getClassName()}
      onOpened={onPopupOpened}
      autoFocus
      enforceFocus
    >
      <div className={Classes.DIALOG_BODY}>
        <p>
          {" "}
          <img alt={t("LOGO")} className="logo" src={imgLog} />
        </p>
        <p id="thanks-msg-quality-raiting" tabIndex="0">
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
            customIcons={[
              {
                icon: starIcon(getFormattedString(t("N_OUT_OF_NUM"), "1", "5")),
              },
              {
                icon: starIcon(getFormattedString(t("N_OUT_OF_NUM"), "2", "5")),
              },
              {
                icon: starIcon(getFormattedString(t("N_OUT_OF_NUM"), "3", "5")),
              },
              {
                icon: starIcon(getFormattedString(t("N_OUT_OF_NUM"), "4", "5")),
              },
              {
                icon: starIcon(getFormattedString(t("N_OUT_OF_NUM"), "5", "5")),
              },
            ]}
          />
        </p>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              aria-disabled={rating === 0 ? "true" : "false"}
              className={`bp5-intent-green${
                rating === 0 ? " bp5-disabled data-invalid" : ""
              }`}
              onClick={() => {
                if (rating !== 0) onSubmitHandle();
              }}
              {...test("SUBMIT_QUALITY_RATING_BTN")}
            >
              {t("SUBMIT")}
            </Button>
            <Button
              {...test("SKIP_QUALITY_RATING_BTN")}
              className="txt-button"
              onClick={onCancel}
            >
              {t("SKIP")}
            </Button>
          </div>
        </div>
      </div>
    </BlueprintDialog>
  );
};

export default connect(null, mapDispatchToProps)(CallQualityRating);
