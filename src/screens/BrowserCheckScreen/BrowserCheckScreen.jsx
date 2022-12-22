import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import MainLogoWhite from "components/MainLogoWhite";
import { useHTMLMessageFormatting, useLanguageDirection } from "utils/hooks";
import { useTranslation } from "react-i18next";
import * as googleAnalytics from "store/actions/googleAnalytics";
import { test } from "utils/helpers";
import { browserNotSupported, isIOS15 } from "utils/browserSupport";
import {
  isMobile as isMobileDevice,
  isIOS,
  isAndroid,
  isWindows,
  isMacOs,
  deviceDetect,
} from "react-device-detect";
import Alert from "components/Alert/Alert";
import APIClient from "services/APIClient";
import { Spinner } from "@blueprintjs/core";

import "./BrowserCheckScreen.scss";

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(googleAnalytics, dispatch),
});

const BrowserCheckScreen = ({ browserIsNotSupported }) => {
  const { t } = useTranslation();
  let navigate = useNavigate();
  const languageDirection = useLanguageDirection();
  const [waitForParams, setWaitForParams] = useState(true);
  const [ios15message, setIOS15message] = useState(null);
  const showActionBar = false;
  const continueAnyway = () => {
    navigate("/InitialScreen");
  };

  const [formatMessage] = useHTMLMessageFormatting();

  useEffect(() => {
    if (isIOS15) {
      const searchParams = new URLSearchParams(window.location.search);
      const portal = decodeURIComponent(searchParams.get("portal")||'');

      if (!portal) {
        console.error("No portal adress for sending customParams request");
        setWaitForParams(false);
        return undefined;
      }

      APIClient.getCustomParameters({ host: portal })
        .then((res) => {
          const ios15message = res?.unregistered?.ios15message;

          if (ios15message) {
            setIOS15message(ios15message);
          } else {
            setWaitForParams(false);
          }
        })
        .catch((e) => {
          console.error("Error while getting custom parameters", e);
          setWaitForParams(false);
        });
    }
    return () => {
      if (
        isIOS15 &&
        sessionStorage.getItem("isIOS15PopupShown") &&
        window.location.search.includes("sessionToken")
      ) {
        sessionStorage.removeItem("isIOS15PopupShown");
      }
    };
  }, []);

  if (window.location.protocol !== "https:") {
    return (window.location.protocol = "https:");
  }

  const getSupportedBrowsersList = () => {
    if (isAndroid) {
      return t("USE_LATEST_VERSION_OF_BROWSERS_ANDROID");
    }
    if (isMobileDevice) {
      if (isIOS) {
        return t("USE_LATEST_VERSION_OF_BROWSERS_IOS");
      } else {
        return t("USE_LATEST_VERSION_OF_BROWSERS_MOBILE");
      }
    }
    if (isWindows) {
      return t("USE_LATEST_VERSION_OF_BROWSERS_WINDOWS");
    }
    if (isMacOs) {
      return t("USE_LATEST_VERSION_OF_BROWSERS_MAC");
    }
    return t("USE_LATEST_VERSION_OF_BROWSERS_DESKTOP");
  };

  if (browserNotSupported) {
    browserIsNotSupported(JSON.stringify(deviceDetect()));
    return (
      <div
        className="browser-not-supported-screen"
        {...test("BROWSER_NOT_SUPPORTED_SCREEN")}
      >
        <div className="content" dir={languageDirection}>
          <MainLogoWhite />
          <div className="message">
            {t("BROWSER_NOT_SUPPORTED")}
            <br />
            <br />
            <div
              dangerouslySetInnerHTML={{
                __html: getSupportedBrowsersList(),
              }}
            ></div>
          </div>

          {showActionBar && (
            <div className="action-bar">
              <button
                onClick={continueAnyway}
                className="bp4-button bp4-intent-secondary"
              >
                {t("CONTINUE_ANYWAY")}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (
    isIOS15 &&
    waitForParams &&
    !sessionStorage.getItem("isIOS15PopupShown")
  ) {
    if (ios15message) {
      // temporary save the flag to avoid showing IOS 15 pop up twice.
      // The second time it heppend after we receive invocation params from a portal and refresh the page
      sessionStorage.setItem("isIOS15PopupShown", true);
    }
    return (
      <div
        className="browser-not-supported-screen"
        {...test("BROWSER_NOT_SUPPORTED_SCREEN")}
      >
        {ios15message ? (
          <div className="content" dir={languageDirection}>
            <MainLogoWhite />
            <Alert
              isOpen={true}
              onConfirm={continueAnyway}
              className="iosAlert"
              message={{
                header: t("WARNING"),
                text: formatMessage(ios15message),
              }}
              buttonText={t("OK")}
            />
          </div>
        ) : (
          <div className="spinner-box">
            <Spinner className="bp4-intent-white" />
          </div>
        )}
      </div>
    );
  }

  return <Navigate replace to={"/InitialScreen"} />;
};

export default connect(null, mapDispatchToProps)(BrowserCheckScreen);
