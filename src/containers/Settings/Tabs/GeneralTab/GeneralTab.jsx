import React from "react";
import { withTranslation } from "react-i18next";
import { Checkbox, MenuItem, Classes } from "@blueprintjs/core";
import GeneralSelectList from "components/GeneralSelectList";
import GlobIcon from "assets/images/settings/language.png";
import { VidyoConnector, FullscreenToggle } from "features";
import { test } from "utils/helpers";
import { isMobileSafari, isAndroid } from "react-device-detect";
import BlurBGCheckbox from "../BlurBGCheckbox";
import { useSelector } from 'react-redux';

import "./GeneralTab.scss";

const GeneralTab = ({ i18n, t, ...props }) => {
  const { urlInitializeWebView } = useSelector(state => state.config);
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

  items.forEach((item) => {
    item.selected = item.value === i18n.language;
  });

  const notificationSoundsEnabled = true;
  const onChange = () => {};
  const autoStart = false;
  const darkModeOn = false;
  const enableNotification = false;

  const customRenderItem = (item, { index, handleClick }) => (
    <MenuItem
      className={item.selected && Classes.ACTIVE}
      onClick={handleClick}
      value={item.value}
      text={<span dangerouslySetInnerHTML={{ __html: item.name }}></span>}
      key={index}
      {...test("SELECT_LANGUAGE_ITEM")}
    />
  );

  const selectedItemName =
    (
      items.filter((item) => {
        return item.value === i18n.language;
      })[0] || {}
    ).name || t("LANGUAGE_NAME_EN");

  return (
    <div className="settings-tab-content general-tab-content">
      <div className="settings-tab-content-header">{t("SETTINGS_GENERAL")}</div>
      <div className="settings-tab-content-body">
        <div className="tab-content-body-panel">
          <GeneralSelectList
            title={t("LANGUAGE")}
            icon={GlobIcon}
            items={items}
            className="language-select"
            onItemSelect={changeLanguage}
            selectedItemName={selectedItemName}
            customRenderItem={customRenderItem}
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
      </div>
    </div>
  );
};

export default withTranslation()(GeneralTab);
