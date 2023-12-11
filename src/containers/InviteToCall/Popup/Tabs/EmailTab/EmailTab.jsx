import React from "react";
import { useTranslation } from "react-i18next";
import { test } from "utils/helpers";
import "./EmailTab.scss";

const EmailTab = () => {
  const { t } = useTranslation();

  return (
    <div
      className="invite-to-call-tab-content email-tab-content"
      {...test("INVITE_EMAIL_TAB")}
    >
      <div className="invite-to-call-content-header">{t("EMAIL")}</div>
      <div className="invite-to-call-content-body"></div>
    </div>
  );
};

export default EmailTab;
