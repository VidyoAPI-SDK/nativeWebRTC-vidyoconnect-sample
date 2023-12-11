import React from "react";
import { test } from "utils/helpers";
import { useTranslation } from "react-i18next";

import "./GuestSettingsIcon.scss";

const GuestSettingsIcon = (props) => {
  const { t } = useTranslation();
  const onClick = props.onClick || null;
  return (
    <div className="guest-settings-icon" onClick={onClick}>
      <button
        aria-label={t("SETTINGS_BUTTON")}
        className="gear-icon"
        {...test("SETTINGS_ICON")}
      ></button>
    </div>
  );
};

export default GuestSettingsIcon;
