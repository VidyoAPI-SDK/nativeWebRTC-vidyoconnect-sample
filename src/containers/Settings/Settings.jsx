import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TabSwitcher from "components/TabSwitcher";
import {
  AboutTab,
  AccountTab,
  GeneralTab,
  HelpTab,
  IntegrationsTab,
  MediaTab,
} from "./Tabs";
import GeneralTabIcon from "assets/images/settings/icon_settings.svg";
import MediaTabIcon from "assets/images/settings/icon_audiovideo.svg";
import IntegrationsTabIcon from "assets/images/settings/icon_integrations.svg";
import AccountTabIcon from "assets/images/settings/icon_account.svg";
import AboutTabIcon from "assets/images/settings/icon_about.svg";
import HelpTabIcon from "assets/images/settings/icon_help.svg";
import { isMobileSafari, isAndroid } from "react-device-detect";
import { useMediaQuery } from "react-responsive";
import { useMobileDimension } from "utils/hooks";
import { test } from "utils/helpers";

import "./Settings.scss";

const Settings = ({ ...props }) => {
  const { t } = useTranslation();
  const [isMobileDimension] = useMobileDimension();
  const isNarrowScreen = useMediaQuery({ maxWidth: 690 });

  const isMobileClass = isMobileDimension || isNarrowScreen;

  let tabs = [
    {
      label: t("SETTINGS_GENERAL"),
      icon: GeneralTabIcon,
      id: "general",
      content: <GeneralTab />,
    },
    {
      label: t("SETTINGS_AUDIO_VIDEO"),
      icon: MediaTabIcon,
      id: "media",
      content: <MediaTab />,
      hideInMobileView: true,
      disabled: isMobileSafari || isAndroid,
    },
    {
      label: t("SETTINGS_ACCOUNT"),
      icon: AccountTabIcon,
      id: "account",
      content: <AccountTab />,
      disabled: process.env.REACT_APP_SETTINGS_ACCOUNT_TAB_DISABLED === "true",
    },
    {
      label: t("SETTINGS_INTEGRATIONS"),
      icon: IntegrationsTabIcon,
      id: "integrations",
      content: <IntegrationsTab />,
      disabled: true,
      hideInMobileView: true,
    },
    {
      label: t("SETTINGS_ABOUT"),
      icon: AboutTabIcon,
      id: "about",
      content: <AboutTab />,
    },
    {
      label: t("SETTINGS_HELP"),
      icon: HelpTabIcon,
      id: "help",
      content: <HelpTab />,
    },
  ];

  if (isMobileDimension) {
    tabs = tabs.filter((tab) => {
      return !tab.hideInMobileView;
    });
  }

  const [activeTab, setActiveTab] = useState(tabs[0]);

  const changeTab = (tabId) => {
    setActiveTab(
      tabs.filter((tab) => {
        return tab.id === tabId;
      })[0]
    );
  };

  useEffect(() => {
    setActiveTab(activeTab);
  }, [activeTab]);

  return (
    <div
      className={`settings-content ${isMobileClass ? "mobile" : ""}`}
      {...test("SETTINGS_POPUP")}
    >
      <div className="settings-close">
        <button
          onClick={props.onClose}
          {...test("SETTINGS_CLOSE_BUTTON")}
        ></button>
      </div>
      <TabSwitcher
        activeTabId={activeTab.id}
        changeTab={changeTab}
        tabs={tabs}
        bottom={isMobileClass}
      />
    </div>
  );
};

export default Settings;
