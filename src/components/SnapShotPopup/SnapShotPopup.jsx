import React, { useRef, useState, useEffect } from "react";
import CSSSpinner from "components/CSSSpinner/CSSSpinner";
import { useTranslation } from "react-i18next";
import { test } from "utils/helpers";
import "./SnapShotPopup.scss";
import { trapFocusInElement } from "utils/accessability";

const SnapShotPopup = ({
  imageData,
  onClose,
  onSaveERP,
  documentMediaTypes,
  hide,
  containerClass,
}) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const select = useRef();

  useEffect(() => {
    const removeTrap = trapFocusInElement({
      elementId: "#snapshot-popup",
      elementSelectorToBeFocused: ".snapshot-popup__header",
      hideContentBeyondModal: true,
    });
    return removeTrap;
  }, []);

  return (
    <div
      aria-modal="true"
      id="snapshot-popup"
      className={`snapshot-popup${hide ? " hide" : ""} ${containerClass}`}
    >
      <div className="snapshot-popup__box">
        <div
          aria-atomic="true"
          tabIndex="-1"
          aria-label={t("SNAPSHOT_HEADER")}
          className="snapshot-popup__header"
        >
          {t("SNAPSHOT_HEADER")}
          <span className="snapshot-popup__close">
            <button
              aria-label={t("CLOSE_POPUP")}
              onClick={onClose}
              {...test("SNAPSHOT_POPUP_CLOSE_BUTTON")}
            ></button>
          </span>
        </div>
        <div className="snapshot-popup__container">
          <div className="snapshot-popup__loader">
            <div className="snapshot-popup__loader-box">{<CSSSpinner />}</div>
          </div>
          <div className="snapshot-popup__preview">
            <div className="snapshot-popup__preview-inner">
              <img src={imageData} alt={t("SNAPSHOT")} />
            </div>
          </div>
          <div className="snapshot-popup__info">
            <form>
              <label>{t("SNAPHOT_DESCRIPTION_TITLE")}</label>
              <textarea
                name="message"
                rows="10"
                cols="30"
                maxLength={32000}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                placeholder={t("SNAPSHOT_DESCRIPTION_PLACEHOLDER")}
                {...test("SNAPSHOT_POPUP_DESCRIPTION")}
              />
              <span className="counter">{description.length}/32000</span>

              <div className="snapshot-popup__document-type">
                <label>{t("SNAPHOT_DOCUMENT_TYPE_TITLE")}</label>
                <select ref={select} {...test("SNAPSHOT_POPUP_DOCUMENT_TYPES")}>
                  {documentMediaTypes?.map?.((type) => (
                    <option value={type?.Id} key={type?.Id}>
                      {type?.Title}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
          <div className="snapshot-popup__footer">
            <div className="snapshot-popup__footer-inner">
              <button
                className="grey"
                onClick={onClose}
                {...test("SNAPSHOT_POPUP_CANCEL")}
              >
                {t("CANCEL")}
              </button>
              <button
                className="green"
                data-invalid={!description ? "true" : "false"}
                aria-disabled={!description ? "true" : "false"}
                onClick={() => {
                  if (!description) return;
                  onSaveERP(imageData, select.current.value, description);
                }}
                {...test("SNAPSHOT_POPUP_SAVE_TO_ERP")}
              >
                {t("SNASHOT_SAVE_ERP")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapShotPopup;
