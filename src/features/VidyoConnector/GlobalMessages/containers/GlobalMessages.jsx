import React from "react";
import { setShareSystemPermissionError } from "../actions/creators";
import { useDispatch, useSelector } from "react-redux";
import { browserName, isMacOs } from "react-device-detect";
import { useTranslation } from "react-i18next";
import Alert from "components/Alert";

const GlobalMessages = () => {
  const { isShareSystemPermissionError } = useSelector(
    (state) => state.vc_globalMessages
  );
  const { t } = useTranslation();
  const dispatch = useDispatch();

  if (isShareSystemPermissionError && isMacOs) {
    return (
      <Alert
        className={"popup-with-button"}
        message={{
          header: t("SHARE_PERMISSIONS_REMINDER_TITLE").replaceAll(
            process.env.REACT_APP_NAME,
            browserName
          ),
          text: (
            <span
              dangerouslySetInnerHTML={{
                __html: t("SHARE_PERMISSIONS_REMINDER_CONTENT").replaceAll(
                  process.env.REACT_APP_NAME,
                  browserName
                ),
              }}
            ></span>
          ),
        }}
        buttonText={t("OK")}
        onConfirm={() => {
          dispatch(setShareSystemPermissionError(false));
        }}
        isOpen={true}
      />
    );
  }
  return null;
};

export default GlobalMessages;
