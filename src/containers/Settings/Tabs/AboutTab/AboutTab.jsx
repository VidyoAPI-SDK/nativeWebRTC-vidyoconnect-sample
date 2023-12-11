import React from "react";
import { useTranslation } from "react-i18next";
import MainLogo from "assets/Logo_black.svg";
import {
  patentNotices,
  vidyoOSSAttributions,
  eulaAgreement,
} from "utils/constants";
import { test } from "utils/helpers";
import "./AboutTab.scss";

const AboutTab = () => {
  const { t } = useTranslation();
  const getLinks = () => (
    <>
      <p
        dangerouslySetInnerHTML={{
          __html: t("ABOUT_VIDYO", {
            patentNotices: patentNotices,
            vidyoOSSAttributions: vidyoOSSAttributions,
          }),
        }}
      ></p>
      <p
        className="eulaLink"
        dangerouslySetInnerHTML={{
          __html: t("EULA_AGREEMENT", {
            eulaAgreement: eulaAgreement,
          }),
        }}
      ></p>
    </>
  );
  return (
    <div
      className="settings-tab-content about-tab-content"
      {...test("ABOUT_PAGE")}
    >
      <div tabIndex="-1" className="settings-tab-content-header">
        {t("SETTINGS_ABOUT")}
      </div>
      <div className="settings-tab-content-body">
        <div tabIndex="0" className="tab-content-body-panel">
          <div className="about-details">
            <img
              className="about-neo-logo"
              {...test("ABOUT_VIDYOCONNECT_LOGO")}
              alt={t("LOGO")}
              src={MainLogo}
            />
            <div className="about-neo" {...test("ABOUT_VIDYOCONNECT")}>
              {t("ABOUT")} {process.env.REACT_APP_NAME}
              <sup>TM</sup>
            </div>
            <div className="about-container">
              <div className="left-line-gradient"></div>
              <div className="about-version">
                <span className="version">{t("VERSION")}</span>
                <span className="build-version" {...test("BUILD_VERSION")}>
                  {window.appConfig.APP_VERSION}
                </span>
              </div>
              <div className="right-line-gradient"></div>
            </div>
          </div>
          <div className="about-details-text" {...test("ABOUT_DETAILS_TEXT")}>
            <div className="about-details-inner-content">{getLinks()}</div>
            <p
              className="copyright"
              {...test("COPYRIGHT")}
              dangerouslySetInnerHTML={{
                __html: t("COPYRIGHT_VIDYO", {
                  copyright_sign: "&copy;",
                  copyright_from: 2008,
                  copyright_to: 2023,
                }),
              }}
            ></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
