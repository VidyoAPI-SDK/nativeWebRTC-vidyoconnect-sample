import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getUserInitials, test } from "utils/helpers";
import "./SettingsButton.scss";

const SettingsButton = ({ toggleSettings, showLabel = true }) => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);
  const userImage = user?.userInfo?.thumbnailPhoto
    ? `data:image/png;base64,${user.userInfo.thumbnailPhoto}`
    : null;

  if (!user.isRegistered) {
    return (
      <div
        tabIndex="0"
        role="button"
        aria-label={t("SETTINGS_BUTTON")}
        className="settings-toggle"
        onClick={toggleSettings}
        {...test("SETTINGS_TOGGLE")}
      >
        <div className="settings-icon"></div>
        <span>{t("SETTINGS_BUTTON")}</span>
      </div>
    );
  }

  return (
    <div
      tabIndex="0"
      role="button"
      aria-label={t("SETTINGS_BUTTON")}
      className="settings-toggle"
      onClick={toggleSettings}
      {...test("SETTINGS_TOGGLE")}
    >
      <div className="settings-avatar">
        {userImage ? (
          <img src={userImage} alt={t("SETTINGS_BUTTON")} />
        ) : (
          <span>{getUserInitials(user?.userInfo?.displayName)}</span>
        )}
      </div>
      {showLabel && <span>{t("SETTINGS_BUTTON")}</span>}
    </div>
  );
};

export default SettingsButton;
