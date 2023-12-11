import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { test } from "utils/helpers";
import storage from "utils/storage";
import { inviteToConference } from "services/SoapAPIProvider/soapAPIRequests/inviteToConference";
import "./DevicesTab.scss";
import { RoomLocked } from "../../RoomLocked/RoomLocked";

const DevicesTab = ({ closeModal }) => {
  const { t } = useTranslation();
  const call = useSelector((state) => state.call);
  const [requestInprogress, setRequestInprogress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const intlInput = useRef();
  const { authToken, portal } = storage.getItem("user") || {};

  const buttonDisabled = requestInprogress || !inputValue.trim().length;

  const sendInvitation = () => {
    if (buttonDisabled) return;
    const conferenceID = call.roomInfo.entityID;
    setRequestInprogress(true);

    const inviteCallback = () => {
      setRequestInprogress(false);
      closeModal();
    };
    inviteToConference(
      portal,
      authToken,
      conferenceID,
      inputValue.trim(),
      +call.roomInfo?.RoomMode?.roomPIN
    ).then((res) => {
      if (res?.Envelope?.Body?.InviteToConferenceResponse?.OK === "OK") {
        inviteCallback();
      } else {
        setTimeout(inviteCallback, 1000);
      }
    });
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const resetInputClickHandler = () => {
    setInputValue("");
  };

  return (
    <div
      className="invite-to-call-tab-content devices-tab-content"
      {...test("INVITE_DEVICE_TAB")}
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
        {call.roomInfo.RoomMode.isLocked === "true" ||
        call.roomInfo.RoomMode.isLocked === true ? (
          <RoomLocked
            portal={portal}
            authToken={authToken}
            roomID={call.roomInfo?.entityID}
          />
        ) : (
          <div className="dial-out">
            <div className="invite-phone-field-wrap">
              <p id="invite-subtitle" className="invite-subtitle">
                {t("ENTER_IP_OR_SIP_TO_CALL")}
              </p>
              <div className="invite-phone-field-wrap">
                <div
                  className={`invite-phone-field ${
                    requestInprogress ? "in-progress" : ""
                  }`}
                >
                  <input
                    aria-labelledby="invite-subtitle"
                    type="text"
                    name="deviceName"
                    className="device-input"
                    value={inputValue}
                    ref={intlInput}
                    onChange={handleInputChange}
                    placeholder={t("ENTER_HERE")}
                  />
                  {inputValue.length > 0 && (
                    <div
                      className="dial-out-input-reset"
                      onClick={resetInputClickHandler}
                    ></div>
                  )}
                </div>
              </div>
            </div>
            <div className="btn-invite-section">
              <button
                className={`invite-btn sms-invite-btn grey`}
                aria-disabled={buttonDisabled ? "true" : "false"}
                data-invalid={buttonDisabled ? "true" : "false"}
                onClick={sendInvitation}
                {...test("INVITE_DEVICE_BUTTON")}
              >
                {t("CALL")}
              </button>
              <p id="additional-info" className="additional-info">
                {t("EMERGENCY_CALL_NOT_SUPPORTED")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicesTab;
