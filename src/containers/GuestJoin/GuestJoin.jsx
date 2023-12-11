import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";
import { ReactComponent as LockedIcon } from "../../assets/images/others/icon_locked.svg";
import { bindActionCreators } from "redux";
import * as userActionCreators from "store/actions/user";
import * as devicesActionCreators from "store/actions/devices";
import * as googleAnalytics from "store/actions/googleAnalytics";
import { useTranslation } from "react-i18next";
import { Button, Label, Classes } from "@blueprintjs/core";
import BeautyInput from "components/BeautyInput";
import TermsConditionsPrivacy from "containers/TermsConditionsPrivacy";
import { test, getFormattedString } from "utils/helpers";
import logger from "utils/logger";
import {
  isIOS,
  isAndroid,
  isSafari,
  isChrome,
  deviceDetect,
} from "react-device-detect";
import SVGSpinner from "components/SVGSpinner";
import Alert from "components/Alert";
import QuickMediaSettings from "containers/QuickMediaSettings";
import "./GuestJoin.scss";
import { useExtDataLogin } from "utils/useExtDataLogin";
import * as callActionCreators from "store/actions/call";
import { isMobile } from "react-device-detect";
import { useIsTouchScreen } from "utils/hooks";
import { Position, Tooltip } from "@blueprintjs/core";
import OperatingSystemInfoProvider from "utils/deviceDetect";

const MemoizedLockedIcon = React.memo(LockedIcon);

const mapStateToProps = ({ call, devices, config }) => {
  return {
    hasMicrophonePermission:
      !devices.microphoneDisableReasons.includes("NO_PERMISSION"),
    hasMicrophone: !!devices.microphones.length,
    selectedCamera: devices.selectedCamera,
    selectedMicrophone: devices.selectedMicrophone,
    selectedSpeaker: devices.selectedSpeaker,
    hardwareCheckCameraState: devices.hardwareCheckCameraState,
    hardwareCheckMicrophoneState: devices.hardwareCheckMicrophoneState,
    hardwareCheckSpeakerState: devices.hardwareCheckSpeakerState,
    urlAccessCode: config.urlAccessCode.value,
    disconnectReason: call.disconnectReason,
    isWebViewEnabled: config.urlInitializeWebView.value,
  };
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators(userActionCreators, dispatch),
  ...bindActionCreators(googleAnalytics, dispatch),
  ...bindActionCreators(callActionCreators, dispatch),
});

const hardwareWarningMessages = {
  0: "HARDWARE_TEST_WARNING_SWITCHED_DEVICES",
  1: "HARDWARE_TEST_WARNING_DEVICES_MARKED_AS_NON_WORKING",
};

const GuestJoin = ({
  updateUser,
  onJoin,
  areSettingsRendered,
  hasCameraPermission,
  hasMicrophonePermission,
  hasSpeakerPermission,
  hasCamera,
  hasMicrophone,
  noDevicePermission,
  urlAccessCode,
  disconnectReason,
  selectedCamera,
  selectedMicrophone,
  selectedSpeaker,
  hardwareCheckCameraState,
  hardwareCheckMicrophoneState,
  hardwareCheckSpeakerState,
  onHardwareLaunchClick,
  isWebViewEnabled,
  ...props
}) => {
  const [isTooltip, setTootltip] = useState(false);
  const [roomPin, setRoomPin] = useState("");
  const [tcEnabled, setTCEnabled] = useState(false);
  const [displayName, setDisplayName] = useState(props.displayName || "");
  const [isValidated, setIsValidated] = useState(false);
  const [spinnerVisible, setSpinnerVisible] = useState(true);
  const [permissionAlertMessage, setPermissionAlertMessage] = useState({
    isOpen: false,
    message: {},
  });
  const [expandError, setExpandError] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const { t } = useTranslation();
  const hasDevicesPermissions = hasMicrophonePermission;
  if (!hasDevicesPermissions) {
    logger.error(`No permission to access camera or microphone}`);
  }
  let location = useLocation();
  const rejoin = (location.state || {})["rejoin"] || false;
  let [, , extDataLoginResponse, extDataLoginError] = useExtDataLogin(rejoin);
  const getPermissionMessage = useCallback(() => {
    if (isAndroid) {
      return t("PERMISSION_ALERT_MESSAGE_ANDROID");
    }
    if (isIOS) {
      return t("PERMISSION_ALERT_MESSAGE_IOS");
    }
    if (isSafari) {
      return t("PERMISSION_ALERT_MESSAGE_SAFARI");
    }
    if (isChrome) {
      return t("PERMISSION_ALERT_MESSAGE_CHROME");
    }
    return t("PERMISSION_ALERT_MESSAGE_DEFAULT");
  }, [t]);

  const trimmedDisplayName = displayName.trim();
  const isTouchScreen =
    useIsTouchScreen() ||
    isMobile ||
    OperatingSystemInfoProvider.IsTabletDevice();

  const onDisplayNameChange = (event) => {
    setDisplayName(event.target.value);
  };

  const onJoinClick = () => {
    if (!isValidData()) return; // hande space and enter clicks on Join btn withot diasble attribute
    if (!isValidated) {
      if (!tcEnabled) {
        setTootltip(true);
      }
      return;
    }
    updateUser({ name: trimmedDisplayName });
    if (onJoin) {
      const data = {
        displayName: trimmedDisplayName,
      };
      if (urlAccessCode) {
        data.roomPin = roomPin;
      }
      onJoin(data);
    }
  };

  const onKeyDownHandler = (e) => {
    if (displayName && e.key === "Enter" && isValidData()) {
      onJoinClick();
    }
  };

  const checkCloudPortalCallback = () => {
    setSpinnerVisible(false);
  };

  const acceptedTC = (userAgreement) => {
    setTootltip(false);
    setIsValidated(userAgreement && trimmedDisplayName);
    setTCEnabled(userAgreement);
  };

  const isValidData = () => {
    if (!hasDevicesPermissions) {
      return false;
    }
    if (urlAccessCode && !roomPin) {
      return false;
    }
    if (!isValidated) {
      return false;
    }
    return true;
  };

  const toggleJoin = () => {
    setIsValidated(trimmedDisplayName && tcEnabled);
  };

  useEffect(toggleJoin, [trimmedDisplayName, tcEnabled]);

  useEffect(() => {
    if (!hasDevicesPermissions) {
      noDevicePermission(JSON.stringify(deviceDetect()));
      setPermissionAlertMessage({
        isOpen: true,
        message: {
          header: t("PERMISSION_ALERT_HEADER"),
          html: getPermissionMessage(),
        },
      });
    }
  }, [hasDevicesPermissions, t, getPermissionMessage, noDevicePermission]);

  useEffect(() => {
    if (
      !hardwareCheckCameraState.id ||
      !hardwareCheckMicrophoneState.id ||
      !hardwareCheckSpeakerState.id
    ) {
      return;
    }
    const hardwareCheckPassed =
      hardwareCheckCameraState.passed &&
      hardwareCheckMicrophoneState.passed &&
      hardwareCheckSpeakerState.passed;

    if (
      hardwareCheckCameraState.id !== selectedCamera.id ||
      hardwareCheckMicrophoneState.id !== selectedMicrophone.id ||
      hardwareCheckSpeakerState.id !== selectedSpeaker.id
    ) {
      setWarningMessage(hardwareWarningMessages["0"]);
    } else if (!hardwareCheckPassed) {
      setWarningMessage(hardwareWarningMessages["1"]);
    } else {
      setWarningMessage("");
    }
  }, [
    setWarningMessage,
    hardwareCheckCameraState,
    hardwareCheckMicrophoneState,
    hardwareCheckSpeakerState,
    selectedCamera,
    selectedMicrophone,
    selectedSpeaker,
  ]);

  const onClickHandler = (e) => {
    if (e.detail === 2) {
      setExpandError(!expandError);
    }
  };

  const showLoginErrorMessage = (errorMessage) => {
    switch (errorMessage) {
      case "Unauthorized":
        return (
          <div
            id="guest-login-error-message"
            className={expandError ? "login-errors expand" : "login-errors"}
            onClick={onClickHandler}
          >
            <div className="login-error-content">
              {t("EXTDATA_LOGIN_ERROR_MESSAGE")}
            </div>
            <div
              id="guest-login-error-code"
              className={expandError ? "error-code" : "error-code none"}
            >
              {getFormattedString(t("ERROR_DESCRIPTION"), errorMessage || "")}{" "}
            </div>
          </div>
        );
      case "VIDYO_CONNECTORFAILREASON_ResourceFull":
        return (
          <div
            id="guest-login-error-message"
            className={expandError ? "login-errors expand" : "login-errors"}
            onClick={onClickHandler}
          >
            <div className="login-error-content">
              {t("ERROR_VIDYO_USERLOGINRESULT_RoomIsFull")}
            </div>
            <div
              id="guest-login-error-code"
              className={expandError ? "error-code" : "error-code none"}
            >
              {getFormattedString(t("ERROR_DESCRIPTION"), errorMessage)}{" "}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleAccessCodeChange = (event) => {
    setRoomPin(event.target.value.trim());
  };

  return (
    <div className={`guest-join-container ${spinnerVisible ? "loading" : ""}`}>
      {extDataLoginError &&
        extDataLoginResponse &&
        showLoginErrorMessage(extDataLoginResponse)}
      {disconnectReason === "VIDYO_CONNECTORFAILREASON_ResourceFull" &&
        showLoginErrorMessage(disconnectReason)}
      {spinnerVisible && (
        <div className="loading">
          <SVGSpinner strokeColor="#51575C" />
          <div className="message">{t("WAIT_WHILE_PAGE_LOADING")}</div>
        </div>
      )}
      <Alert
        buttonText={t("PERMISSION_ALERT_BUTTON")}
        onConfirm={() => {
          window.location.reload();
        }}
        message={permissionAlertMessage.message}
        isOpen={permissionAlertMessage.isOpen}
      />
      <div className={`guest-join-content ${!spinnerVisible ? "visible" : ""}`}>
        <Label className="welcome">
          <div
            id="welcomeTextOnGuestPage"
            tabIndex="0"
            dangerouslySetInnerHTML={{
              __html: t("GUEST_TO_JOIN_THE_CALL_ENTER_YOUR_NAME"),
            }}
          ></div>
        </Label>
        <BeautyInput
          value={displayName}
          placeholder={t("DISPLAY_NAME")}
          onChange={onDisplayNameChange}
          onKeyDown={onKeyDownHandler}
          disabled={props.changeNameDisabled}
          aria-required="true"
          onBlur={() => window.getSelection()?.removeAllRanges()}
          {...test("DISPLAY_NAME_INPUT")}
        />
        {urlAccessCode && !spinnerVisible && (
          <div className="access-code-container">
            <div className="header">
              <p>
                <MemoizedLockedIcon width="16" height="16" />
                <span tabIndex="0" id="accessCodeRequiredToJoinText">
                  {t("ACCESS_CODE_REQUIRED_TO_JOIN")}
                </span>
              </p>
            </div>
            <BeautyInput
              {...test("ACCESS_CODE_INPUT")}
              id="accessCodeBueautyInput"
              value={roomPin}
              placeholder={t("ENTER_ACCESS_CODE")}
              onChange={handleAccessCodeChange}
              onKeyDown={onKeyDownHandler}
              aria-required="true"
              onBlur={() => window.getSelection()?.removeAllRanges()}
            />
            <p
              id="dontKnowAccesCodeText"
              tabIndex="0"
              className="guest-bottom-text"
            >
              {t("DONT_KNOW_ACCESS_CODE")}
            </p>
          </div>
        )}
        {props.beautyScreenToggle && !isWebViewEnabled && (
          <div className="block-2">
            <QuickMediaSettings deviceMenuStyle="white" />
          </div>
        )}
        {!!warningMessage && (
          <div
            role="alert"
            aria-live="polite"
            id="hardware-check-warning-message"
            className="hardware-check-warning"
          >
            {warningMessage === hardwareWarningMessages["0"] ? (
              <span>{t(hardwareWarningMessages["0"])}</span>
            ) : (
              <span>{t(hardwareWarningMessages["1"])}</span>
            )}
          </div>
        )}
        {props.beautyScreenToggle && !isWebViewEnabled && (
          <div className="hardware-check-launch-cointainer">
            <Tooltip
              content={t("TEST_CONFERENCE_HARDWARE_TOOLTIP")}
              portalClassName="voluantary-hwt-tooltip"
              position={Position.TOP_CENTER}
              disabled={isTouchScreen}
            >
              <div
                role="button"
                className="hardware-check-launch"
                onClick={onHardwareLaunchClick}
                {...test("LAUNCH_HARDWARE_CHECK")}
              >
                {t("TEST_CONFERENCE_HARDWARE")}
              </div>
            </Tooltip>
          </div>
        )}
        <Button
          id="gustJoinButton"
          fill={true}
          data-invalid={!isValidData()}
          aria-disabled={!isValidData() ? "true" : "false"}
          aria-labelledby="gustJoinButton termsAndConditionText"
          tabIndex="0"
          className={Classes.INTENT_SUCCESS}
          onClick={onJoinClick}
          {...test("JOIN_BUTTON")}
        >
          {t("JOIN")}
        </Button>
        <TermsConditionsPrivacy
          areSettingsRendered={areSettingsRendered}
          acceptedTC={acceptedTC}
          isValidated={isValidated}
          isTooltip={isTooltip}
          checkCloudPortalCallback={checkCloudPortalCallback}
        />
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GuestJoin);
