import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
// intlTelInput has poor support for ARIA
import intlTelInput from "../../../../../external/intlTelInput/intlTelInput";
import intlTelInputUtils from "../../../../../external/intlTelInput/utils";
import "../../../../../external/intlTelInput/intlTelInput.scss";
import { getFormattedString, test } from "utils/helpers";
import storage from "utils/storage";
import Spinner from "components/Spinner/Spinner";
import { inviteToConference } from "services/SoapAPIProvider/soapAPIRequests/inviteToConference";
import Modal from "components/Modal/Modal";
import { RoomLocked } from "../../RoomLocked/RoomLocked";
import InfoMsg from "../../InfoMsg/InfoMsg";
import "./CallTab.scss";
import { useModerationStatuses } from "utils/hooks";
import showNotification from "components/Notifications/Notifications";

let iti = "";
const alreadyInvited = {};

const CallTab = ({ closeModal }) => {
  const { t } = useTranslation();
  const config = useSelector((state) => state.config);
  const { isRegistered } = useSelector((state) => state.user);
  const call = useSelector((state) => state.call);
  const [requestInprogress, setRequestInprogress] = useState(null);
  const [alreadySentShow, setAlreadySentShow] = useState(null);
  const [numberError, setErrorMessage] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [wrongConfigs, setWrongConfigs] = useState(false);
  const intlInput = useRef();
  const { authToken, portal } = storage.getItem("user") || {};
  const { isRoomLocked } = useModerationStatuses();

  const errorMap = {
    1: t("PHONE_NUMBER_INVALID_COUNTRY_CODE"),
    2: t("PHONE_NUMBER_IS_TOO_SHORT"),
    3: t("PHONE_NUMBER_IS_TOO_LONG"),
    incorrectСountryСodes: t("PHONE_NUMBER_WRONG_CONFIGS"),
    generalWrongConfigs: t("GENERAL_WRONG_CONFIGS"),
    default: t("PHONE_NUMBER_INVALID"),
  };

  const checkPhoneNumber = () => {
    const value = inputValue.trim();
    const selectedCountry = iti.getSelectedCountryData();
    if ((value && !iti.isValidNumber()) || !selectedCountry.name) {
      const errorCode = iti.getValidationError();
      const errorMsg = errorMap[errorCode] || errorMap["default"];
      setErrorMessage(errorMsg);
    } else {
      setErrorMessage(null);
    }
  };

  useEffect(
    () => {
      if (!isRoomLocked) {
        let countryCodes = (
          isRegistered
            ? config.customParameters?.callOutServiceCountryCodes || ""
            : ""
        )
          .toLowerCase()
          .split(";");
        const countryData = window.intlTelInputGlobals.getCountryData();
        const iso2List = countryData.map((country) => country.iso2);
        countryCodes = countryCodes.filter(
          (country) => iso2List.indexOf(country) !== -1
        );

        const intlConfig = {
          preferredCountries: [],
          initialCountry: countryCodes[0],
          responsiveDropdown: true,
          separateDialCode: true,
          utilsScript: intlTelInputUtils,
          customPlaceholder: (
            selectedCountryPlaceholder,
            selectedCountryData
          ) => t("CALL_OUT_ENTER_PHONE_NUMBER"),
        };

        if (countryCodes.length) {
          intlConfig.onlyCountries = countryCodes;
        }
        iti = intlTelInput(intlInput.current, intlConfig);
        intlInput.current.addEventListener("countrychange", checkPhoneNumber);
        if (!countryCodes.length) {
          iti.setCountry("");
          setWrongConfigs(true);
          setErrorMessage(errorMap["incorrectСountryСodes"]);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [call.roomInfo.RoomMode.isLocked]
  );

  const getUnformattedNumber = function () {
    const number = iti.telInput.value.trim();
    let result = number;
    if (result.indexOf("+") !== 0) {
      result = `+${iti.selectedCountryData.dialCode}${number}`;
    }
    return result;
  };

  const sendInvitation = () => {
    const conferenceID = call.roomInfo.entityID;
    const number = iti.getNumber().replace(/\D/g, "");
    const callOutServicePrefix = isRegistered
      ? config.customParameters?.callOutServicePrefix
      : null;
    setRequestInprogress(true);
    showNotification("bannerWithBtns", {
      type: "banner",
      showFor: 10000,
      message: `${getFormattedString(
        t("OUTGOING_CALL_TO"),
        getUnformattedNumber()
      )}`,
      buttons: [
        {
          autoClickAfterNSeconds: 10,
          text: `${t("HIDE")}`,
        },
      ],
    });

    const inviteCallback = () => {
      setRequestInprogress(false);
      alreadyInvited[number] = true;
      closeModal();
    };
    inviteToConference(
      portal,
      authToken,
      conferenceID,
      `${callOutServicePrefix || ""}${number}`,
      +call.roomInfo?.RoomMode?.roomPIN
    ).then((res) => {
      if (res?.Envelope?.Body?.InviteToConferenceResponse?.OK === "OK") {
        inviteCallback();
      } else {
        setTimeout(inviteCallback, 1000);
      }
    });
  };

  const callBtnDisabled =
    numberError || requestInprogress || !inputValue.trim().length;

  const sendCallInvitationHandler = () => {
    if (callBtnDisabled) return;
    const number = iti.getNumber().replace(/\D/g, "");
    if (number && !numberError) {
      if (alreadyInvited[number]) {
        setAlreadySentShow(true);
      } else {
        sendInvitation();
      }
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setErrorMessage(null);
  };

  const closeInfoPopup = (event) => {
    setAlreadySentShow(false);
  };

  return (
    <div
      className={`invite-to-call-tab-content call-tab-content ${
        wrongConfigs ? "wrong-configs" : ""
      }`}
      {...test("INVITE_CALL_TAB")}
    >
      <div className="invite-to-call-content-body">
        <div
          tabIndex="-1"
          className="invite-to-call-content-header"
          id="invite-to-call-content-header"
          aria-labelledby="invite-to-call-content-header additional-info"
        >
          {t("CALLING_ADD_PERSON_TO_CALL")}
        </div>
        <div className="inv-out-line"></div>
        {isRoomLocked ? (
          <RoomLocked
            portal={portal}
            authToken={authToken}
            roomID={call.roomInfo?.entityID}
          />
        ) : (
          <div className="dial-out">
            <div className="invite-phone-field-wrap">
              {numberError && (
                <div role="alert" aria-live="assertive" className="error-msg">
                  {numberError}
                </div>
              )}
              <div className="invite-phone-field">
                <input
                  aria-required="true"
                  aria-invalid={numberError ? "true" : "false"}
                  type="tel"
                  name="phoneNumber"
                  disabled={wrongConfigs}
                  className="phone-input"
                  value={inputValue}
                  ref={intlInput}
                  onChange={handleInputChange}
                  onBlur={checkPhoneNumber}
                />
              </div>
            </div>
            <div className="btn-invite-section">
              <button
                className={`invite-btn sms-invite-btn grey`}
                data-invalid={callBtnDisabled ? "true" : "false"}
                aria-disabled={callBtnDisabled ? "true" : "false"}
                onClick={sendCallInvitationHandler}
                {...test("INVITE_CALL_BUTTON")}
              >
                {requestInprogress && (
                  <Spinner
                    style={{ position: "absolute", top: "5px", left: "10px" }}
                    height="32"
                  />
                )}
                {t("CALL")}
              </button>
              <p id="additional-info" className="additional-info">
                {t("EMERGENCY_CALL_NOT_SUPPORTED")}
              </p>
            </div>
          </div>
        )}
      </div>
      <Modal>
        {alreadySentShow && (
          <InfoMsg
            onAction={sendInvitation}
            onClose={closeInfoPopup}
            header={t("PHONE_CONFIRMATION_HEADER")}
            message={t("PHONE_CONFIRMATION_MESSAGE")}
            actionButtonText={t("CALL")}
          />
        )}
      </Modal>
    </div>
  );
};

export default CallTab;
