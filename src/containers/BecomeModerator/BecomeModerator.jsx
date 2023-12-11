import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Position, Tooltip } from "@blueprintjs/core";
import showNotification from "components/Notifications/Notifications";
import { OutlineButton } from "components/OutlineButton/OutlineButton";
import { getLectureModeParticipantsRequest } from "services/SoapAPIProvider/soapAPIRequests/getLectureModeParticipants";
import { updateUser } from "store/actions/user";
import moderatorIcon from "assets/images/callModeration/become_moderator.png";
import storage from "utils/storage";
import { useModerationStatuses } from "utils/hooks";
import { saveRoomPin } from "store/actions/call";
import { getEntityDetailsByID } from "services/SoapAPIProvider/soapAPIRequests/getEntityDetailsByID";
import { getUserInitials, getFormattedString } from "utils/helpers";
import "./BecomeModerator.scss";

export const BecomeModerator = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const pinInput = useRef();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isPinFormatValid, setIsPinFormatValid] = useState(false);
  const [isPinWrong, setIsPinWrong] = useState(false);
  const [roomOwnerData, setRoomOwnerData] = useState(null);
  const call = useSelector((state) => state.call);
  const { authToken, portal } = storage.getItem("user") || {};

  const { isRoomHasPin } = useModerationStatuses();

  const togglePanelClickHandler = () => setIsPanelOpen((prev) => !prev);

  const inputChangeHandler = (e) => {
    setInputValue(e.target.value);
  };

  const checkPinFormat = useCallback(() => {
    if (
      !inputValue.trim().length ||
      inputValue.trim().length < 3 ||
      inputValue.trim().length > 12 ||
      !/^[\d]+$/gi.test(inputValue.trim())
    ) {
      setIsPinFormatValid(false);
    } else {
      setIsPinFormatValid(true);
    }
  }, [inputValue]);

  const submitFormHandler = () => {
    if (!isPinFormatValid) return;

    getLectureModeParticipantsRequest(
      portal,
      authToken,
      call.roomInfo?.entityID,
      inputValue.trim()
    ).then((res) => {
      if (res) {
        dispatch(
          updateUser({
            accountType: "admin",
            becomeModerator: true,
          })
        );
        dispatch(saveRoomPin(inputValue.trim()));
        setIsPinWrong(false);
        showNotification("banner", {
          message: t("CM_YOU_ARE_NOW_MODERATOR"),
          icon: moderatorIcon,
        });
      } else {
        setIsPinWrong(true);
      }
    });
  };

  const onKeyDownHandler = (e) => {
    if (e.key === "Enter") {
      submitFormHandler();
    }
  };

  useEffect(() => {
    if (isPanelOpen) {
      pinInput.current.focus();
    }
  }, [isPanelOpen]);

  useEffect(() => {
    checkPinFormat();
    setIsPinWrong(false);
  }, [checkPinFormat, inputValue]);

  useEffect(
    () => {
      getEntityDetailsByID(portal, authToken, call.roomInfo?.ownerID).then(
        (res) => {
          if (res) {
            setRoomOwnerData({
              displayName: res?.displayName,
              thumbnail: res?.thumbnailPhoto,
              title: res?.title,
              department: res?.department,
            });
          }
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      /* on mount only */
    ]
  );

  if (!isRoomHasPin) {
    return null;
  }

  return (
    <div className="change-role">
      {isPanelOpen && (
        <div className="change-role__box">
          <p id="change-role__top-title" className="change-role__top-title">
            {t("CM_SWITCH_MODERATOR_PIN_HEDER")}
          </p>
          <div className="change-role__form">
            <div className="change-role__input-wrap">
              <Tooltip
                portalClassName="change-role__error-msg"
                content={
                  <span role="alert" aria-live="polite">
                    {t("CM_ERROR_INVALID_PIN")}
                  </span>
                }
                isOpen={isPinWrong}
                position={Position.TOP}
              >
                <input
                  type="text"
                  aria-labelledby="change-role__top-title"
                  className={`change-role__input ${isPinWrong ? "error" : ""}`}
                  onChange={inputChangeHandler}
                  value={inputValue}
                  onBlur={checkPinFormat}
                  ref={pinInput}
                  onKeyDown={onKeyDownHandler}
                  autoFocus={true}
                />
              </Tooltip>
            </div>
            <button
              className="change-role__submit"
              aria-disabled={!isPinFormatValid ? "true" : "false"}
              data-invalid={!isPinFormatValid ? "true" : "false"}
              onClick={submitFormHandler}
            >
              {t("SUBMIT")}
            </button>
          </div>
          <p tabIndex="0" className="change-role__bottom-title">
            {t("CM_SWITCH_MODERATOR_PIN_FOOTER")}
          </p>
          <div className="change-role__owner-box">
            {roomOwnerData ? (
              <div className="change-role__owner">
                <div className="change-role__avatar">
                  {roomOwnerData?.thumbnail ? (
                    <img
                      src={`data:image/png;base64,${roomOwnerData.thumbnail}`}
                      alt={t("SWITCH_TO_MODERATOR")}
                    />
                  ) : (
                    <span>{getUserInitials(roomOwnerData?.displayName)}</span>
                  )}
                </div>
                <div className="change-role__owner-info">
                  <p
                    tabIndex="0"
                    aria-label={getFormattedString(
                      t("ROOM_OWNER_IS"),
                      roomOwnerData?.displayName
                    )}
                    className="change-role__owner-name"
                  >
                    {roomOwnerData?.displayName}
                  </p>
                  {roomOwnerData?.title && roomOwnerData?.department && (
                    <span className="change-role__owner-title">{`${roomOwnerData?.title} - ${roomOwnerData?.department}`}</span>
                  )}
                </div>
              </div>
            ) : (
              <svg
                className="owner-avatar-loader"
                width="54"
                height="54"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="48" stroke="#aaa"></circle>
                <circle cx="50" cy="50" r="40" stroke="#aaa"></circle>
                <circle cx="50" cy="50" r="25" stroke="#aaa"></circle>
                <circle cx="50" cy="50" r="15" stroke="#aaa"></circle>
              </svg>
            )}
          </div>
        </div>
      )}
      <OutlineButton
        aria-expanded={isPanelOpen ? "true" : "false"}
        label={t("SWITCH_TO_MODERATOR")}
        testId={"SWITCH_TO_MODERATOR"}
        onClick={togglePanelClickHandler}
      />
    </div>
  );
};
