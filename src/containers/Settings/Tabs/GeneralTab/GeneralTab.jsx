import React, { useState } from "react";
import { withTranslation } from "react-i18next";
import { Checkbox, MenuItem, Classes, Collapse } from "@blueprintjs/core";
import GeneralSelectList from "components/GeneralSelectList";
import GlobIcon from "assets/images/settings/language.png";
import { VidyoConnector, FullscreenToggle } from "features";
import { test, isCustomParamEnabled } from "utils/helpers";
import { isMobileSafari, isAndroid } from "react-device-detect";
import BlurBGCheckbox from "../BlurBGCheckbox";
import { setCaptionBackground, setCaptionFontSize } from "store/actions/config";
import { useDispatch, useSelector } from "react-redux";
import { useMobileDimension, useOrientation } from "utils/hooks";
import storage from "utils/storage";
import "./GeneralTab.scss";

const GeneralTab = ({ i18n, t, ...props }) => {
  const { urlInitializeWebView } = useSelector((state) => state.config);
  const changeLanguage = (item) => {
    i18n.changeLanguage(item.value);
  };

  let items = [
    {
      value: "en",
      name: t("LANGUAGE_NAME_EN"),
    },
    {
      value: "fr",
      name: t("LANGUAGE_NAME_FR"),
    },
    {
      value: "de",
      name: t("LANGUAGE_NAME_DE"),
    },
    {
      value: "es",
      name: t("LANGUAGE_NAME_ES"),
    },
    {
      value: "it",
      name: t("LANGUAGE_NAME_IT"),
    },
    {
      value: "pl",
      name: t("LANGUAGE_NAME_PL"),
    },
    {
      value: "zh",
      name: t("LANGUAGE_NAME_ZH"),
    },
    {
      value: "ja",
      name: t("LANGUAGE_NAME_JA"),
    },
    {
      value: "ko",
      name: t("LANGUAGE_NAME_KO"),
    },
    {
      value: "uk",
      name: t("LANGUAGE_NAME_UK"),
    },
  ];

  const fontSize = [
    { name: "150%", value: "27px" },
    { name: "100%", value: "18px" },
    { name: "75%", value: "14px" },
  ];
  const backgroundColor = [
    { name: t("BACKGROUND_WHITE"), value: "#ffffff" },
    { name: t("BACKGROUND_BLACK"), value: "#000000" },
  ];
  const [isMobileDimension] = useMobileDimension();
  const [orientation] = useOrientation();
  const dispatch = useDispatch();
  const {
    captionFontSize,
    captionBackground,
    customParameters,
    listOfGCPServices,
    portalFeatures,
    jwtToken,
  } = useSelector((state) => state.config);
  const isCCEnabled =
    portalFeatures?.CcEnabled &&
    listOfGCPServices?.closedCaption?.isServiceAvailable &&
    listOfGCPServices?.closedCaption?.url &&
    !isCustomParamEnabled(customParameters?.closedCaptioningDisabled) &&
    jwtToken;
  let fontColor = captionBackground === "#ffffff" ? "#000000" : "#ffffff";
  items.forEach((item) => {
    item.selected = item.value === i18n.language;
  });

  const notificationSoundsEnabled = true;
  const onChange = () => {};
  const autoStart = false;
  const darkModeOn = false;
  const enableNotification = false;
  const [isCollapseOpen, setCollapseOpen] = useState(false);

  const customRenderItem = (item, { index, handleClick }) => (
    <MenuItem
      aria-selected={item.selected ? "true" : "false"}
      role="option"
      tabIndex="0"
      className={item.selected && Classes.ACTIVE}
      onClick={handleClick}
      value={item.value}
      text={<span dangerouslySetInnerHTML={{ __html: item.name }}></span>}
      key={index}
      {...test("SELECT_LANGUAGE_ITEM")}
    />
  );
  const customRenderFontSizeItem = (item, { index, handleClick }) => (
    <MenuItem
      aria-selected={item.name === selectedFontSize ? "true" : "false"}
      role="option"
      tabIndex="0"
      className={item.name === selectedFontSize && Classes.ACTIVE}
      onClick={handleClick}
      value={item.value}
      text={<span dangerouslySetInnerHTML={{ __html: item.name }}></span>}
      key={index}
      {...test("SELECT_FONT_SIZE_ITEM")}
    />
  );
  const customRenderFontBackgroundItem = (item, { index, handleClick }) => (
    <MenuItem
      aria-selected={item.name === selectedCaptionBackground ? "true" : "false"}
      role="option"
      tabIndex="0"
      className={item.name === selectedCaptionBackground && Classes.ACTIVE}
      onClick={handleClick}
      value={item.value}
      text={<span dangerouslySetInnerHTML={{ __html: item.name }}></span>}
      key={index}
      {...test("SELECT_FONT_BACKGROUND_ITEM")}
    />
  );
  const handleClick = () => {
    setCollapseOpen(!isCollapseOpen);
  };
  const selectedFontSize = fontSize.filter((item) => {
    return item.value === captionFontSize;
  })[0].name;
  const selectedCaptionBackground = backgroundColor.filter((item) => {
    return item.value === captionBackground;
  })[0].name;
  const selectedItemName =
    (
      items.filter((item) => {
        return item.value === i18n.language;
      })[0] || {}
    ).name || t("LANGUAGE_NAME_EN");

  return (
    <div className="settings-tab-content general-tab-content">
      <div tabIndex="-1" className="settings-tab-content-header">
        {t("SETTINGS_GENERAL")}
      </div>
      <div
        className={`settings-tab-content-body ${
          isMobileDimension ? " " + orientation : ""
        }`}
      >
        <div className="tab-content-body-panel">
          <GeneralSelectList
            title={t("LANGUAGE")}
            icon={GlobIcon}
            items={items}
            className="language-select"
            onItemSelect={changeLanguage}
            selectedItemName={selectedItemName}
            customRenderItem={customRenderItem}
            matchTargetWidth={isMobileDimension && orientation === "portrait"}
            buttonProps={{
              ...test("SELECT_LANGUAGE"),
            }}
          />
        </div>

        {autoStart && (
          <div className="checkbox-section">
            <Checkbox
              checked={autoStart}
              onChange={onChange}
              className={Classes.INTENT_SUCCESS}
              label={t("APP_AUTO_START_CHECKBOX_LABEL")}
            />
          </div>
        )}

        {enableNotification && (
          <div className="checkbox-section">
            <Checkbox
              {...test("ENABLE_NOTIFICATION_SOUNDS")}
              checked={notificationSoundsEnabled}
              onChange={onChange}
              className={Classes.INTENT_SUCCESS}
              label={t("ENABLE_NOTIFICATION_SOUNDS")}
              disabled={true}
            />
          </div>
        )}

        {darkModeOn && (
          <div className="checkbox-section">
            <Checkbox
              checked={darkModeOn}
              onChange={onChange}
              className={Classes.INTENT_SUCCESS}
              label={t("ENABLE_DARK_THEME")}
            />
          </div>
        )}
        {(isAndroid || isMobileSafari) && !urlInitializeWebView.value && (
          // show chackbox only on mobile devices due to disbled media tab on them
          <BlurBGCheckbox t={t} />
        )}
        <FullscreenToggle className="checkbox-section" />
        <VidyoConnector.AdvancedSettings />
        {isCCEnabled && (
          <React.Fragment>
            <div className="setting-divider"></div>
            <button
              onClick={handleClick}
              className="accordion-button"
              aria-expanded={isCollapseOpen ? "true" : "false"}
              aria-controls="close-caption-settings"
            >
              <div
                className={`accordion-tab${isCollapseOpen ? " active" : ""}`}
              >
                <div className="device-header">
                  <span className="device-icon caption-icon"></span>
                  <span className="device-heading">{t("CLOSED_CAPTION")}</span>
                </div>
              </div>
            </button>
            <Collapse isOpen={isCollapseOpen}>
              <div
                id="close-caption-settings"
                className={`accordion ${
                  isMobileDimension ? " " + orientation : ""
                }`}
              >
                <div className="accordion-content">
                  <div className="left-content">
                    <div className="js-select-font-size select-container">
                      <div className="font-selector select-container">
                        <GeneralSelectList
                          title={t("FONT_SIZE")}
                          items={fontSize}
                          className="language-select"
                          onItemSelect={(item) => {
                            dispatch(setCaptionFontSize(item.value));
                            storage.addItem("cc_font_size", item.value);
                          }}
                          customRenderItem={customRenderFontSizeItem}
                          selectedItemName={selectedFontSize}
                          matchTargetWidth={
                            isMobileDimension && orientation === "portrait"
                          }
                          buttonProps={{
                            ...test("SELECT_FONT_SIZE"),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="right-content">
                    <div className="js-select-caption-background select-container">
                      <div className="font-selector select-container">
                        <GeneralSelectList
                          title={t("CAPTION_BACKGROUND")}
                          items={backgroundColor}
                          className="language-select"
                          onItemSelect={(item) => {
                            dispatch(setCaptionBackground(item.value));
                            storage.addItem("cc_font_background", item.value);
                          }}
                          customRenderItem={customRenderFontBackgroundItem}
                          selectedItemName={selectedCaptionBackground}
                          matchTargetWidth={
                            isMobileDimension && orientation === "portrait"
                          }
                          buttonProps={{
                            ...test("SELECT_FONT_SIZE"),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="font-selector select-container">
                    <span className="font-heading">{t("CAPTION_PREVIEW")}</span>
                    <div
                      className="caption-preview"
                      style={{
                        backgroundColor: captionBackground,
                        color: fontColor,
                        fontSize: captionFontSize,
                      }}
                    >
                      <div>{t("CAPTION_PREVIEW_TEXT")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Collapse>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default withTranslation()(GeneralTab);
