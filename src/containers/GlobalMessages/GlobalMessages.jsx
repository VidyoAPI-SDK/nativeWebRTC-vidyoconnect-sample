import React from "react";
import { Button } from "@blueprintjs/core";
import { useSelector } from "react-redux";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useTranslation } from "react-i18next";
import { generateLogs } from "store/actions/app";
import { test } from "utils/helpers";
import Alert from "components/Alert";
import "./GlobalMessages.scss";

const mapStateToProps = (state) => ({
  inProgress: state.app.generatingLogsInProgress,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({ generateLogs }, dispatch),
});

const GlobalMessages = ({ inProgress, generateLogs }) => {
  const tabIsDisabled = useSelector((state) => state.app.tabIsDisabled);
  const initError = useSelector((state) => state.app.initError);
  const networkConnectionStatus = useSelector(
    (state) => state.app.networkConnectionStatus
  );
  const { t } = useTranslation();
  console.log("networkConnectionStatus - ", networkConnectionStatus);

  if (initError) {
    return (
      <Alert
        className={"popup-with-button"}
        message={{
          header: t("BROWSER_APPLICATION_ERROR_HEADER"),
          text: t("BROWSER_APPLICATION_ERROR_MESSAGE"),
        }}
        buttonText={t("PERMISSION_ALERT_BUTTON")}
        onConfirm={() => {
          window.location.reload();
        }}
        isOpen={true}
      />
    );
  }

  if (tabIsDisabled) {
    return (
      <Alert
        className={"popup-without-button"}
        message={{
          header: t("BROWSER_TAB_UNLOAD_HEADER"),
          text: t("BROWSER_TAB_UNLOAD_MESSAGE"),
        }}
        isOpen={true}
      />
    );
  }

  if (!networkConnectionStatus) {
    return (
      <>
        <div className="offline-banner">
          <div className="text" role="alert">
            {t("SEEMS_YOU_ARE_OFFLINE_TRY_RECONNECTING")}
            <Button
              {...test("GENERATE_REPORT")}
              disabled={inProgress}
              className={"bp5-intent-pink btn-download-log"}
              onClick={() => generateLogs()}
            >
              {t("DOWNLOAD_LOGS")}
            </Button>
          </div>
        </div>
        <div id="overlay"></div>
      </>
    );
  }

  return null;
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalMessages);
