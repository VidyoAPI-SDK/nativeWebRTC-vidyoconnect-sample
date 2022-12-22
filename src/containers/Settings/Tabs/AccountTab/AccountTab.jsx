import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { endCall } from "store/actions/call";
import { logout } from "store/actions/user";
import { getUserInitials, test } from "utils/helpers";
import avatarImage from "../../../../assets/images/settings/avatar.png";
import "./AccountTab.scss";

const AccountTab = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const userImage = user?.userInfo?.thumbnailPhoto
    ? `data:image/png;base64,${user.userInfo.thumbnailPhoto}`
    : null;

  const signOutCLikcHanler = useCallback(() => {
    dispatch(endCall());
    dispatch(logout());
  }, [dispatch]);

  const singInClickHanlder = useCallback(() => {
    const loginLink = `${
      window.appConfig.REACT_APP_LOGIN_URL
    }/oauth?grant_type=authorization_code&response_type=code&client_id=VidyoConnectWebRTC&redirect_uri=${
      window.location.origin + window.location.pathname
    }&state=${encodeURIComponent(window.location.search)}`;
    window.location.href = loginLink;
  }, []);

  if (user.isRegistered) {
    return (
      <div className="settings-tab-content account-tab-content">
        <div className="settings-tab-content-header">
          {t("SETTINGS_ACCOUNT")}
        </div>
        <div className="settings-tab-content-body">
          <div className="account-tab-content__user-box">
            <div className="account-tab-content__img">
              {userImage ? (
                <img src={userImage} alt={t("SETTINGS_YOU_ARE_GUEST_USER")} />
              ) : (
                <span>{getUserInitials(user?.userInfo?.displayName)}</span>
              )}
            </div>
            <h2 className="account-tab-content__title">
              {user?.userInfo?.displayName}
            </h2>
            <div className="account-tab-content__email">
              <a href={`mailto:${user?.userInfo?.emailAddress}`}>
                {user?.userInfo?.emailAddress}
              </a>
            </div>
            <div className="account-tab-content__actions">
              <ul>
                {/* TODO Get API and implement Reset Password */}
                {/* <li className="account-tab-content__change-pass">{t('CHANGE_PASSWORD')}</li> */}
                <li
                  className="account-tab-content__logout"
                  onClick={signOutCLikcHanler}
                >
                  {t("SIGN_OUT")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-tab-content account-tab-content">
      <div className="settings-tab-content-header">{t("SETTINGS_ACCOUNT")}</div>
      <div className="settings-tab-content-body">
        <div className="account-tab-content__guest-box">
          <div className="account-tab-content__img">
            <img src={avatarImage} alt={t("SETTINGS_YOU_ARE_GUEST_USER")} />
          </div>
          <h2
            className="account-tab-content__title"
            {...test("SETTINGS_YOU_ARE_GUEST_USER")}
          >
            {t("SETTINGS_YOU_ARE_GUEST_USER")}
          </h2>
          {window.appConfig.REACT_APP_SIGN_IN_ENABLED && (
            <div className="account-tab-content__login">
              <button
                className="bp4-button bp4-fill bp4-intent-success"
                onClick={singInClickHanlder}
                {...test("SIGNIN")}
              >
                {t("SIGNIN")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountTab;
