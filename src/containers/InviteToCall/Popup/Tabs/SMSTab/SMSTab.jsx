import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getFormattedString, test } from "utils/helpers";
import { connect } from "react-redux";
import { isUserAuthorized } from "utils/login";
import intlTelInput from "../../../../../external/intlTelInput/intlTelInput";
import intlTelInputUtils from "../../../../../external/intlTelInput/utils";
import "../../../../../external/intlTelInput/intlTelInput.scss";
import ContentEditable from "react-contenteditable";
import storage from "../../../../../utils/storage";
import { bindActionCreators } from "redux";
import * as configActionCreators from "../../../../../store/actions/config";
import Modal from "../../../../../components/Modal";
import InfoMsg from "../../InfoMsg/InfoMsg";
import "./SMSTab.scss";
import Spinner from "../../../../../components/Spinner";
import { RoomLocked } from "../../RoomLocked/RoomLocked";
import showNotification from "components/Notifications/Notifications";

const mapStateToProps = ({ config, call, user }, props) => ({
  customParameters: config.customParameters,
  urlPortal: config.urlPortal,
  urlRoomKey: config.urlRoomKey,
  gcpServices: config.listOfGCPServices,
  props: props,
  roomID: call.roomInfo?.entityID,
  isLocked: call.roomInfo?.RoomMode?.isLocked,
  isAccessCode: call.roomInfo?.RoomMode?.hasPIN,
  isRegistered: user?.isRegistered,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(configActionCreators, dispatch),
});

let iti = "";
const alreadyInvited = {};

const SMSTab = ({
  props,
  customParameters,
  urlPortal,
  urlRoomKey,
  gcpServices,
  sendSMS,
  roomID,
  isLocked,
  isAccessCode,
  isRegistered,
}) => {
  const getContryCodes = function () {
    const countryCodes = (customProp.smsServiceCountryCodes || "")
      .toLowerCase()
      .split(";");
    const countryData = window.intlTelInputGlobals.getCountryData();

    const iso2List = countryData.map((country) => {
      return country.iso2;
    });
    return countryCodes.filter((country) => {
      return iso2List.indexOf(country) !== -1;
    });
  };
  const { authToken, portal } = storage.getItem("user") || {};
  const { t } = useTranslation();
  const customProp = isRegistered ? customParameters : null;
  const errorMap = {
    1: t("PHONE_NUMBER_INVALID_COUNTRY_CODE"),
    2: t("PHONE_NUMBER_IS_TOO_SHORT"),
    3: t("PHONE_NUMBER_IS_TOO_LONG"),
    incorrectСountryСodes: t("PHONE_NUMBER_WRONG_CONFIGS"),
    generalWrongConfigs: t("GENERAL_WRONG_CONFIGS"),
    default: t("PHONE_NUMBER_INVALID"),
  };
  const countryCodes = getContryCodes();
  const roomLink = ` ${urlPortal.value}/join/${urlRoomKey.value}${
    customProp.smsServiceForceWebRTC === "1" ? "?jvw=1" : ""
  }`;
  const smsServiceCustomTXT = customProp.smsServiceCustomTXT.trim();
  const onlyRead =
    customProp.smsServiceUserCannotChangeTXT === "1" ? true : false;
  const defaultSMSText = t("SMS_MESSAGE");
  const maxSizeSMS = 160;

  const [numberError, setErrorMessage] = useState("");
  const [smsError, setSMSErrorMessage] = useState("");
  const [inProgress, setSMSInProgress] = useState(false);
  const [wrongConfigs, setWrongConfigs] = useState(false);
  const [isEmptyMessage, setEmptyMsgText] = useState(true);
  const [smsText, setSMSText] = useState(
    smsServiceCustomTXT ? smsServiceCustomTXT : defaultSMSText
  );
  const [smsSize, setSmsSize] = useState(0);
  const [isTextOverflow, setTextOverflow] = useState(false);
  const [isInfoMsgRendered, setInfoMsgRenderState] = useState(false);

  const initializeIntlTelInput = function () {
    const intlInput = document.querySelector("#smsPhone");
    function checkPhoneNumber() {
      const value = intlInput.value.trim();
      const selectedCountry = iti.getSelectedCountryData();
      if ((value && !iti.isValidNumber()) || !selectedCountry.name) {
        const errorCode = iti.getValidationError();
        const errorMsg = errorMap[errorCode] || errorMap["default"];
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage("");
      }
    }

    const config = {
      preferredCountries: [],
      initialCountry: countryCodes[0],
      responsiveDropdown: true,
      separateDialCode: true,
      utilsScript: intlTelInputUtils,
      customPlaceholder: (selectedCountryPlaceholder, selectedCountryData) =>
        t("SMS_ENTER_PHONE_NUMBER"),
    };

    if (countryCodes.length) {
      config.onlyCountries = countryCodes;
    }
    iti = intlTelInput(intlInput, config);

    intlInput.addEventListener("countrychange", checkPhoneNumber);
    intlInput.addEventListener("input", () => {
      const selectedCountry = iti.getSelectedCountryData();
      setEmptyMsgText(!selectedCountry.name || !intlInput.value.trim());
      setErrorMessage("");
    });
    intlInput.addEventListener("blur", checkPhoneNumber);
  };
  const getMsgSize = useCallback(
    (smsTxt) => {
      var textArea = document.createElement("textarea");
      textArea.innerHTML = smsTxt;
      return textArea.value.length + roomLink.length;
    },
    [roomLink]
  );

  useEffect(
    () => {
      if (isLocked === "false" || isLocked === false) {
        const msgSize = getMsgSize(smsText);
        initializeIntlTelInput();
        if (!countryCodes.length) {
          iti.setCountry("");
          setWrongConfigs(true);
          setErrorMessage(errorMap["incorrectСountryСodes"]);
        }
        if (msgSize > maxSizeSMS) {
          setSMSErrorMessage(errorMap["generalWrongConfigs"]);
          setWrongConfigs(true);
        }
      }
    },
    // eslint-disable-next-line
    [isLocked]
  );

  useEffect(() => {
    const msgSize = getMsgSize(smsText);
    setSmsSize(msgSize);
    setTextOverflow(msgSize > maxSizeSMS);
  }, [getMsgSize, smsText, roomLink]);

  const handleChange = (event) => {
    setSMSText(event.target.value.replace(/<[^>]+>/g, ""));
  };

  const send = function () {
    const number = iti.getNumber();
    const sms = smsText + roomLink;
    const url = gcpServices.sendSMS.url;
    if (isUserAuthorized(portal)) {
      sendSMS({ url, portal, authToken, number, sms }, (result) => {
        setSMSInProgress(false);
        props.closeModal();

        showNotification("bannerWithBtns", {
          type: "banner",
          showFor: 10000,
          message: `${getFormattedString(
            result ? t("SMS_WAS_SENT") : t("SMS_NOT_SENT"),
            getUnformattedNumber()
          )}`,
          buttons: [
            {
              autoClickAfterNSeconds: 10,
              text: `${t("HIDE")}`,
            },
          ],
        });
      });
      alreadyInvited[number] = smsText;
      closeInfoMsg();
      setSMSInProgress(true);
    } else {
      console.log("User isn't authorized");
    }
  };

  const getUnformattedNumber = function () {
    const number = iti.telInput.value.trim();
    let result = number;
    if (result.indexOf("+") !== 0) {
      result = `+${iti.selectedCountryData.dialCode}${number}`;
    }
    return result;
  };

  const sendButtonDisaled =
    numberError || isEmptyMessage || isTextOverflow || smsError || inProgress;

  const sendSMSInvitation = () => {
    if (sendButtonDisaled) return;

    const numberData = iti.getNumber();
    const sms = smsText + roomLink;
    if (numberData && sms) {
      if (alreadyInvited[numberData]) {
        setInfoMsgRenderState(true);
      } else {
        send();
      }
    }
  };

  const handleKeyPress = (event) => {
    const text = event.target.innerHTML;
    if (
      getMsgSize(text) >= maxSizeSMS &&
      event.keyCode !== 8 &&
      event.keyCode !== 37 &&
      event.keyCode !== 38 &&
      event.keyCode !== 39 &&
      event.keyCode !== 40
    ) {
      event.preventDefault();
    }
  };

  const handlePaste = (event) => {
    const text = event.target.innerHTML;
    const dif = maxSizeSMS - roomLink.length;
    if (text.length >= dif) {
      event.preventDefault();
    }
  };

  const closeInfoMsg = () => {
    setInfoMsgRenderState(false);
  };

  return (
    <div
      className={`invite-to-call-tab-content sms-tab-content ${
        wrongConfigs ? "wrong-configs" : ""
      }`}
      {...test("INVITE_SMS_TAB")}
    >
      <div className="invite-to-call-content-body">
        <div tabIndex="-1" className="invite-to-call-content-header">
          {t("SMS_ADD_PERSON_TO_CALL")}
        </div>
        <div className="inv-out-line"></div>
        {isLocked === "true" || isLocked === true ? (
          <RoomLocked portal={portal} authToken={authToken} roomID={roomID} />
        ) : (
          <div className="inv-sms">
            <div className="invite-phone-field-wrap">
              {numberError && (
                <div aria-live="assertive" role="alert" className="error-msg">
                  {numberError}
                </div>
              )}
              <div className="invite-phone-field">
                <input
                  aria-required="true"
                  aria-invalid={numberError ? "true" : "false"}
                  disabled={wrongConfigs}
                  type="tel"
                  name="smsPhone"
                  className="phone-input"
                  id="smsPhone"
                />
              </div>
            </div>
            <div id="sms-text-message" className="invitation-label">
              {onlyRead ? t("SMS_TEXT_MESSAGE") : t("SMS_ENTER_TEXT_MESSAGE")}
            </div>
            <div
              id="sms-text-error-msg"
              className="error-msg"
              aria-live="assertive"
              role="alert"
              style={{
                visibility: smsError ? "visible" : "hidden",
                opacity: smsError ? 1 : 0,
              }}
            >
              {smsError}
            </div>

            <div
              className={`sms-message-wrapper ${onlyRead ? "onlyread" : ""}`}
            >
              <ContentEditable
                className="sms-message"
                role="textbox"
                aria-multiline={true}
                aria-labelledby="sms-text-message"
                aria-readonly={onlyRead ? "true" : "false"}
                contentEditable={true}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                html={smsText}
              />
              <div className="room-link">{roomLink}</div>
            </div>
            <div className="hint-section">
              <div
                className="has-pin-message"
                style={{
                  visibility: isAccessCode === "true" ? "visible" : "hidden",
                }}
              >
                {t("SMS_HINT_MESSAGE")}
              </div>
              <div
                className="sms-size"
                style={{ visibility: onlyRead ? "hidden" : "visible" }}
              >{`${smsSize}/${maxSizeSMS}`}</div>
            </div>
            <div className="btn-invite-section">
              <button
                className={`invite-btn sms-invite-btn grey`}
                value="SMS-INVITE"
                data-invalid={sendButtonDisaled ? "true" : "false"}
                aria-disabled={sendButtonDisaled ? "true" : "false"}
                onClick={sendSMSInvitation}
              >
                {inProgress && (
                  <Spinner
                    style={{ position: "absolute", top: "5px", left: "10px" }}
                    height="32"
                  />
                )}
                {t("SMS_SEND_BUTTON")}
              </button>
            </div>
          </div>
        )}
      </div>
      <Modal>
        {isInfoMsgRendered && (
          <InfoMsg
            onAction={send}
            onClose={closeInfoMsg}
            header={t("SMS_CONFIRMATION_HEADER")}
            message={t("SMS_CONFIRMATION_MESSAGE")}
            actionButtonText={t("SMS_SEND_BUTTON")}
          />
        )}
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SMSTab);
