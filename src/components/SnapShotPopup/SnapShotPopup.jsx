import React, { useRef, useState } from "react";
import CSSSpinner from "components/CSSSpinner/CSSSpinner";
import { useTranslation } from "react-i18next";
import { test } from "utils/helpers";
import "./SnapShotPopup.scss";

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

  return (
    <div className={`snapshot-popup${hide ? " hide" : ""} ${containerClass}`}>
      <div className="snapshot-popup__box">
        <div className="snapshot-popup__header">
          {t("SNAPSHOT_HEADER")}
          <span className="snapshot-popup__close">
            <button
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
              <img src={imageData} alt="snapshot" />
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
                disabled={!description}
                onClick={() =>
                  onSaveERP(imageData, select.current.value, description)
                }
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
