import React, { useState, useRef, useEffect, useCallback } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  isCustomParamEnabled,
  useRequestsInProgress,
} from "../../utils/helpers";
import CameraCheck from "./CameraCheck";
import MicrophoneCheck from "./MicrophoneCheck";
import SpeakerCheck from "./SpeakerCheck";
import { portalJWTRequest } from "utils/portalJWTRequest";
import { isMobile } from "react-device-detect";
import OperatingSystemInfoProvider from "utils/deviceDetect";
import APIClient from "services/APIClient";
import CSSSpinner from "components/CSSSpinner/CSSSpinner";
import showNotification from "components/Notifications/Notifications";
import * as devicesActionCreators from "store/actions/devices";
import {
  hardwareCheckCamera,
  hardwareCheckMicrophone,
  hardwareCheckSpeaker,
  hardwareCheckTestClose,
  hardwareCheckContactInfoClicked
} from "store/actions/googleAnalytics";

import "./HardwareCheckPopup.scss";
import { bindActionCreators } from "redux";
import { generateLogs } from "store/actions/app";
import { test } from "utils/helpers";
import { useHTMLMessageFormatting } from "utils/hooks";
import { unsafeParseTextFromHTMLString } from "utils/helpers";

const mapStateToProps = ({ devices, app }) => ({
  selectedCamera: devices.selectedCamera,
  selectedMicrophone: devices.selectedMicrophone,
  selectedSpeaker: devices.selectedSpeaker,
  setHardwareCheckCameraState: devices.setHardwareCheckCameraState,
  setHardwareCheckMicrophoneState: devices.setHardwareCheckMicrophoneState,
  setHardwareCheckSpeakerState: devices.setHardwareCheckSpeakerState,
  inProgress: app.generatingLogsInProgress,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(devicesActionCreators, dispatch),
  ...bindActionCreators({ generateLogs }, dispatch),
});

const HardwareCheckPopup = ({
  onPopupClose,
  onPopupLoad,
  selectedCamera,
  selectedMicrophone,
  selectedSpeaker,
  setHardwareCheckCameraState,
  setHardwareCheckMicrophoneState,
  setHardwareCheckSpeakerState,
  isVolutanryHardwareCheck,
  generateLogs,
  inProgress,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const config = useSelector((state) => state.config);
  const [currentTestID, setCurrentTestID] = useState(0);
  const DEVICE_TEST_TYPE = ["speaker", "microphone", "camera"];
  const [epicServerURL, setEpicServerURL] = useState(null);
  const [isDataAlreadySent, setIsDataAlreadySent] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [isSendingDataInProgress, setIsSendingDataInProgress] = useState(false);
  const [helpText, setHelpText] = useState(null);
  const [contactEmail, setContactEmail] = useState(null);
  const [contactPhone, setContactPhone] = useState(null);
  const [formatMessage] = useHTMLMessageFormatting();
  const [showContactInformation, setShowContactInformation] = useState(false);
  let isPopupOpen = useRef(false);
  let deviceStatus = useRef({
    camera: "",
    microphone: "",
    speaker: "",
  });

  const [isRequestInProgress, addRequestInProgress, deleteRequestInProgress] =
    useRequestsInProgress();

  const handleError = (e, message) => {
    const error = e?.response?.data?.error
      ? e.response.data.error?.message || JSON.stringify(e.response.data.error)
      : e?.message;

    console.error(`EPIC hardware test: ${message}. Reason:`, error);
  };

  useEffect(() => {
    if (!isPopupOpen.current) {
      onPopupLoad();
      isPopupOpen.current = true;
    }
  }, [onPopupLoad]);

  const getTestResultCode = () => {
    let code = 0;
    if (deviceStatus.current.camera === "no") {
      code += 2;
    }
    if (deviceStatus.current.microphone === "no") {
      code += 4;
    }
    if (deviceStatus.current.speaker === "no") {
      code += 8;
    }
    return code;
  };

  const setHardwareCheckResult = () => {
    setHardwareCheckCameraState({
      id: selectedCamera.id,
      passed: deviceStatus.current.camera !== "no",
    });
    setHardwareCheckMicrophoneState({
      id: selectedMicrophone.id,
      passed: deviceStatus.current.microphone !== "no",
    });
    setHardwareCheckSpeakerState({
      id: selectedSpeaker.id,
      passed: deviceStatus.current.speaker !== "no",
    });
  };

  const onDataSend = useCallback(
    (url, message) => {
      setIsDataAlreadySent(true);
      deleteRequestInProgress(url);
      setIsSendingDataInProgress(false);
      setShowPopup(false);

      if (onPopupClose) {
        onPopupClose();
      }

      showNotification("bannerWithBtns", {
        type: "banner",
        className: "hardware-success",
        showFor: 10000,
        message: message,
        buttons: [
          {
            autoClickAfterNSeconds: 10,
            text: `${t("HIDE")}`,
          },
        ],
      });
    },
    [deleteRequestInProgress, onPopupClose, t]
  );

  const sendData = useCallback(() => {
    const url = `${epicServerURL}/setexternalhardwaretest`;
    const portal = config.urlPortal.value;
    const token = config.urlSessionToken?.value;

    const options = {
      url: url,
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      data: {
        token: token,
        tenantUrl: portal,
        hardwareTestStatus: getTestResultCode(),
      },
    };

    if (epicServerURL && token && !isVolutanryHardwareCheck) {
      setIsSendingDataInProgress(true);

      if (!isRequestInProgress(url)) {
        addRequestInProgress(url);

        portalJWTRequest(options)
          .then(() => {
            onDataSend(url, t("HARDWARE_TEST_SEND_DATA_SUCCESS"));
          })
          .catch((e) => {
            handleError(e, "Error while sending data to server");
            onDataSend(url, t("HARDWARE_TEST_SEND_DATA_FAILED"));
          });
      }
    } else {
      setShowPopup(false);
      if (onPopupClose) {
        onPopupClose();
      }
    }
  }, [
    addRequestInProgress,
    config.urlPortal.value,
    config.urlSessionToken.value,
    epicServerURL,
    isRequestInProgress,
    onDataSend,
    onPopupClose,
    t,
    isVolutanryHardwareCheck,
  ]);

  useEffect(() => {
    const portal = config.urlPortal.value;
    const extData = config.extData;
    const extDataType = config.extDataType;

    if (!!extData && +extDataType === 1) {
      APIClient.getCustomParameters({ host: portal })
        .then((res) => {
          const customParams = res?.unregistered;
          if (!customParams)
            throw new Error("Custom Parameters are not available");

          const { epicServiceEnabled, vidyoCloudServicesURL } = customParams;
          if (!isCustomParamEnabled(epicServiceEnabled))
            throw new Error("Epic service isn't enabled in custom parameters");
          if (!vidyoCloudServicesURL)
            throw new Error(
              "vidyoCloudServicesURL not configured in custom parameters"
            );

          return vidyoCloudServicesURL;
        })
        .then((vidyoCloudServicesURL) => {
          return APIClient.getGCPServicesList({ vidyoCloudServicesURL }).then(
            (res) => {
              const { epicService } = res;

              if (!epicService)
                throw new Error("epicService data isn't available");
              if (!epicService?.isServiceAvailable)
                throw new Error("epicService is not available");

              setEpicServerURL(epicService?.url);

              return res;
            }
          );
        })
        .catch((e) => {
          handleError(e, "Error while getting initial data");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const portal = config.urlPortal.value;
    APIClient.getCustomParameters({ host: portal })
      .then((res) => {
        const customParams = res?.unregistered;
        if (!customParams)
          throw new Error("Custom Parameters are not available");
        Object.entries(customParams).forEach(([key, value]) => {
          switch (key) {
            case "HWTContactInfo":
              setHelpText(value);
              break;
            case "HWTContactPhone":
              setContactPhone(value);
              break;
            case "HWTContactEmail":
              setContactEmail(value);
              break;
            default:
              break;
          }
        });
      })
      .catch((e) => {
        handleError(e, "Error while getting initial data");
      });
  }, [config.urlPortal.value]);

  const isContactInformationVisible = () => {
    return contactEmail || contactPhone || helpText;
  };

  useEffect(() => {
    if (
      epicServerURL &&
      !isSendingDataInProgress &&
      !isDataAlreadySent &&
      currentTestID === 3
    ) {
      sendData();
    }
  }, [
    currentTestID,
    epicServerURL,
    isDataAlreadySent,
    isSendingDataInProgress,
    sendData,
  ]);

  const onNextButtonClick = (deviceWorkingStatus) => {
    deviceStatus.current[DEVICE_TEST_TYPE[currentTestID]] = deviceWorkingStatus;
    if (currentTestID === 2) {
      sendData();
      setHardwareCheckResult();
    }
    if (DEVICE_TEST_TYPE[currentTestID] === "camera") {
      dispatch(hardwareCheckCamera(deviceWorkingStatus));
    } else if (DEVICE_TEST_TYPE[currentTestID] === "microphone") {
      dispatch(hardwareCheckMicrophone(deviceWorkingStatus));
    } else if (DEVICE_TEST_TYPE[currentTestID] === "speaker") {
      dispatch(hardwareCheckSpeaker(deviceWorkingStatus));
    }
    setCurrentTestID(currentTestID + 1);
  };

  const displayContactInformation = (e) => {
    let el = e.target;
    while (el && el !== e.currentTarget && el.tagName !== "SPAN") {
      el = el.parentNode;
    }
    if (el && el.tagName === "SPAN") {
      dispatch(hardwareCheckContactInfoClicked());
      setShowContactInformation(true);
    }
  };

  if (!showPopup) {
    return null;
  }

  return (
    <div className="popup-bg">
      {showContactInformation && (
        <div
          className={
            "contact-info-cointainer" +
            (isMobile || OperatingSystemInfoProvider.IsTabletDevice()
              ? " mobile-cointainer "
              : isContactInformationVisible
              ? " make-center"
              : "")
          }
        >
          {isContactInformationVisible() && (
            <div className="help-text-headline">{t("NEED_HELP")}</div>
          )}
          {helpText && (
            <div className="help-text">
              {formatMessage(unsafeParseTextFromHTMLString(helpText))}
            </div>
          )}
          {(contactEmail || contactPhone) && (
            <div className="reach-out-cointainer">
              {contactEmail && (
                <div className="email-cointainer">
                  <a className="email-image" href={"mailto:" + contactEmail}>
                    <div>{contactEmail}</div>
                  </a>
                </div>
              )}
              {contactPhone && (
                <div className="phone-cointainer">
                  <a className="phone-image" href={"tel:" + contactPhone}>
                    <div>{contactPhone}</div>
                  </a>
                </div>
              )}
            </div>
          )}
          {isContactInformationVisible() && (
            <div className="contact-info-divider"></div>
          )}
          {
            <div className="tech-diffi-cointainer">
              <div className="tech-diff-title">
                {t("TECHNICAL_DIFFICULTIES")}
              </div>
              <p className="tech-diff-text">{t("GENERATE_REPORT_WEB")}</p>
              <button
                {...test("GENERATE_REPORT")}
                className="tech-generate-report-button"
                onClick={() => {
                  generateLogs();
                }}
              >
                {t("DOWNLOAD")}
              </button>
            </div>
          }
          <span className="contact-info-close">
            <button
              onClick={() => {
                setShowContactInformation(false);
              }}
            ></button>
          </span>
        </div>
      )}
      <div
        className={
          (isMobile || OperatingSystemInfoProvider.IsTabletDevice()
            ? "mobile-cointainer "
            : "browser ") + "device-panel"
        }
      >
        {isVolutanryHardwareCheck && (
          <span className="hardware-popup-close">
            <button
              onClick={() => {
                dispatch(hardwareCheckTestClose());
                setShowPopup(false);
                if (onPopupClose) {
                  onPopupClose();
                }
              }}
            ></button>
          </span>
        )}
        {isSendingDataInProgress && (
          <div className="hw-loader">
            <CSSSpinner />
          </div>
        )}
        <div
          className="heading-txt"
          onClick={displayContactInformation}
          dangerouslySetInnerHTML={{
            // eslint-disable-next-line no-useless-concat
            __html:
              t("HARDWARE_TEST_HEADING_MOBILE") +
              " " +
              '<span class="click-here">' +
              t("CLICK_HERE_FOR_HELP") +
              "</span>",
          }}
        ></div>

        {DEVICE_TEST_TYPE[currentTestID] === "camera" && (
          <CameraCheck
            onButtonClick={onNextButtonClick}
            isVolutanryHardwareCheck={isVolutanryHardwareCheck}
          ></CameraCheck>
        )}
        {DEVICE_TEST_TYPE[currentTestID] === "speaker" && (
          <SpeakerCheck
            onButtonClick={onNextButtonClick}
            isVolutanryHardwareCheck={isVolutanryHardwareCheck}
          ></SpeakerCheck>
        )}
        {DEVICE_TEST_TYPE[currentTestID] === "microphone" && (
          <MicrophoneCheck
            onButtonClick={onNextButtonClick}
            isVolutanryHardwareCheck={isVolutanryHardwareCheck}
          ></MicrophoneCheck>
        )}

        <div className="slide-circle">
          <span className={currentTestID === 0 ? "active" : ""}></span>
          <span className={currentTestID === 1 ? "active" : ""}></span>
          <span className={currentTestID === 2 ? "active" : ""}></span>
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(HardwareCheckPopup);
