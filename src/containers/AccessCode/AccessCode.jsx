import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ReactComponent as LockedIcon } from "assets/images/others/icon_locked.svg";
import { Button, Classes, Position, Tooltip } from "@blueprintjs/core";
import BeautyInput from "components/BeautyInput";
import QuickMediaSettings from "containers/QuickMediaSettings";
import { test } from "utils/helpers";
import { isAndroid } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import * as callActionCreators from "store/actions/call";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import "./AccessCode.scss";

const MemoizedLockedIcon = React.memo(LockedIcon);

const mapStateToProps = ({ config }) => {
  return {
    isWebViewEnabled: config.urlInitializeWebView.value
  };
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
});

const AccessCode = ({
  urlAccessCode,
  incorrectPinTooltip,
  areSettingsRendered,
  onJoin,
  rejoinCall,
  isWebViewEnabled
}) => {
  const [accessCode, setAccessCode] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isPinTooltipOpened, showPinTooltip] = useState(true);

  const handleAccessCodeChange = (event) => {
    setAccessCode(event.target.value.trim());
    showPinTooltip(false);
  };

  const onJoinClick = () => {
    if (onJoin) {
      onJoin({
        accessCode,
      });
    }
  };

  const onKeyDownHandler = (e) => {
    if (accessCode && e.key === "Enter") {
      onJoinClick();
    }
  };

  const goBack = () => {
    if (isAndroid) {
      window.location.reload();
    } else {
      rejoinCall();
      navigate("/InitialScreen", {state: { rejoin: true }});
    }
  };

  useEffect(() => {
    if (areSettingsRendered) {
      showPinTooltip(false);
    }
  }, [areSettingsRendered]);

  return (
    <div className="access-code-container">
      <div className="header">
        <p>
          <MemoizedLockedIcon width="16" height="16" />
          <span>{t("ACCESS_CODE_REQUIRED_TO_JOIN")}</span>
        </p>
      </div>
      <div className="controls">
        <Tooltip
          portalClassName="access-code-tooltip"
          isOpen={isPinTooltipOpened}
          content={
            <span {...test("ACCESS_CODE_ERROR_MESSAGE")}>
              {!incorrectPinTooltip && !urlAccessCode
                ? t("PLEASE_ENTER_ACCESS_CODE")
                : t("INCORRECT_ACCESS_CODE")}
            </span>
          }
          popoverClassName={Classes.INTENT_DANGER}
          position={Position.TOP}
        >
          <BeautyInput
            {...test("ACCESS_CODE_INPUT")}
            value={accessCode}
            style={
              isPinTooltipOpened && {
                boxShadow: "inset 0 0 0 2px #E4281B",
              }
            }
            placeholder={t("ENTER_ACCESS_CODE")}
            onChange={handleAccessCodeChange}
            onKeyDown={onKeyDownHandler}
          />
        </Tooltip>
        <p className="guest-bottom-text">{t("DONT_KNOW_ACCESS_CODE")}</p>
        {!isWebViewEnabled && 
          <div className="block-2">
            <QuickMediaSettings deviceMenuStyle="white" />
          </div>
        }
        <Button
          {...test("JOIN_BUTTON")}
          fill={true}
          disabled={!accessCode}
          className={Classes.INTENT_SUCCESS}
          onClick={onJoinClick}
        >
          {t("JOIN")}
        </Button>
        <div className="go-back-to-guest-ui" onClick={goBack}>
          {t("CANCEL_AND_GO_BACK")}
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AccessCode);
