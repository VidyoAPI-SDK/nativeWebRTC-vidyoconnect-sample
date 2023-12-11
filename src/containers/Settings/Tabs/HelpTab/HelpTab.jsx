import React from "react";
import { Button } from "@blueprintjs/core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { test } from "utils/helpers";

import { generateLogs } from "store/actions/app";

import { useTranslation } from "react-i18next";
import "./HelpTab.scss";

const mapStateToProps = (state) => ({
  inProgress: state.app.generatingLogsInProgress,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({ generateLogs }, dispatch),
});

const HelpTab = ({ inProgress, generateLogs }) => {
  const { t } = useTranslation();

  return (
    <div className="settings-tab-content help-tab-content">
      <div tabIndex="-1" className="settings-tab-content-header">
        {t("SETTINGS_HELP")}
      </div>
      <div className="settings-tab-content-body">
        <div className="tab-content-body-panel">
          <div
            tabIndex="0"
            className="tab-content-body-panel-center help-tab-content"
          >
            <h3 {...test("TECHNICAL_DIFFICULTIES_MESSAGE")}>
              {t("TECHNICAL_DIFFICULTIES")}
            </h3>
            <p {...test("HELP_MESSAGE")}>{t("GENERATE_REPORT_WEB")}</p>
            <Button
              {...test("GENERATE_REPORT")}
              disabled={inProgress}
              className={"bp5-intent-pink"}
              onClick={() => generateLogs()}
            >
              {t("DOWNLOAD")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(HelpTab);
