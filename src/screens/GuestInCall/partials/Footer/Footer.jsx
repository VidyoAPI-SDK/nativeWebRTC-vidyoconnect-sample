import React, { memo, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button, Classes, Popover, Position, Tooltip } from "@blueprintjs/core";
import ClosedCaptions from "containers/ClosedCaptions/ClosedCaptions";
import { endCall, setCcBtnIsActive } from "store/actions/call";
import * as googleAnalytics from "store/actions/googleAnalytics";
import SpeakerToggle from "containers/QuickMediaSettings/toggles/SpeakerToggle";
import MicrophoneToggle from "containers/QuickMediaSettings/toggles/MicrophoneToggle";
import CameraToggle from "containers/QuickMediaSettings/toggles/CameraToggle";
import FlipCameraButton from "containers/FlipCameraButton/FlipCameraButton";
import InviteToCallButton from "containers/InviteToCall/Button/Button";
import ShareButton from "containers/Share/Button/Button";
import ChatToggle from "containers/Chat/Toggle";
import {
  getUrlChatIsDefault,
  getUrlChatValue,
  getShareButtonToggleValue,
} from "store/selectors/config";
import {
  getCcButtonActive,
  getCcRequestInProgress,
} from "store/selectors/call";
import { getBreakoutRooms } from "store/selectors/features";
import {
  breakoutRaiseHand,
  breakoutUnraiseHand,
  setIsShowBreakoutLeftDialog,
} from "features/BreakoutRooms/actions/creators";
import {
  useIsTouchScreen,
  useMobileDimension,
  useModerationStatuses,
  useOrientation,
} from "utils/hooks";
import { test } from "utils/helpers";
import { isAndroid, isMobile, isMobileSafari } from "react-device-detect";
import OperatingSystemInfoProvider from "utils/deviceDetect";
import { isUserAuthorized } from "utils/login";
import { useLocation } from "react-router-dom";
import hotkeys from "hotkeys-js";
import {
  getShortcutKeys,
  getShortcutKeysText,
  keyShortcutsLog,
} from "utils/keyboardShortcuts";

const Footer = ({
  isWebViewEnabled,
  portalFeatures,
  isBrRoomsEnabled,
  isCCEnabled,
  toggleInviteToCallPopup,
  dataForAudioVideoContent,
  isChatOpen,
  toggleChat,
}) => {
  const breakoutRooms = useSelector(getBreakoutRooms);
  const urlChatIsDefault = useSelector(getUrlChatIsDefault);
  const urlChatValue = useSelector(getUrlChatValue);
  const shareButtonToggleValue = useSelector(getShareButtonToggleValue);
  const ccInProgress = useSelector(getCcRequestInProgress);
  const ccBtnActive = useSelector(getCcButtonActive);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const [orientation] = useOrientation();
  const [isMobileDimension] = useMobileDimension();
  const isTouchScreen =
    useIsTouchScreen() ||
    isMobile ||
    OperatingSystemInfoProvider.IsTabletDevice();
  const { isUserAdmin, isUserRoomOwner } = useModerationStatuses();
  const showInviteButton =
    isUserAuthorized(location.state?.host) && (isUserAdmin || isUserRoomOwner);

  const mobilePortrait = isMobileDimension && orientation === "portrait";
  const isShowRequestHelpButton =
    isBrRoomsEnabled && breakoutRooms.isRoomBreakout;

  const CLOSED_CAPTION = getShortcutKeysText(
    t("SHORTCUT_CLOSED_CAPTION"),
    getShortcutKeys().TOOGLE_CC
  );

  const LEAVE_THE_CALL = getShortcutKeysText(
    t("SHORTCUT_LEAVE_THE_CALL"),
    getShortcutKeys().END_CALL
  );

  const IN_CALL_CHAT = getShortcutKeysText(
    t("SHORTCUT_IN_CALL_CHAT"),
    getShortcutKeys().TOOGLE_CHAT_PANEL
  );

  const INVITE_TO_CALL = getShortcutKeysText(
    t("SHORTCUT_INVITE_TO_CALL"),
    getShortcutKeys().TOOGLE_INVITE_PANEL
  );

  function handleEndCallClick() {
    if (!breakoutRooms.isRoomBreakout) {
      dispatch(endCall());
    } else {
      dispatch(setIsShowBreakoutLeftDialog(true));
    }
  }

  const showMoreButton = () => {
    let count = 1;
    if (showInviteButton) {
      count++;
    }
    const chatButtonToggle = urlChatIsDefault
      ? portalFeatures?.["EndpointPublicChat"]
      : urlChatValue;
    if (chatButtonToggle) {
      count++;
    }
    if (isMobile || isAndroid || !shareButtonToggleValue) {
      //do nothing
    } else {
      count++;
    }
    return count > 1;
  };

  const raiseHandButtonClickHandler = () => {
    if (breakoutRooms.raiseHandButtonActive) {
      dispatch(breakoutUnraiseHand());
      dispatch(googleAnalytics.breakoutRoomClick("UnraiseHand"));
    } else {
      dispatch(breakoutRaiseHand());
      dispatch(googleAnalytics.breakoutRoomClick("RaiseHand"));
    }
  };

  const onCcClick = useCallback(() => {
    dispatch(setCcBtnIsActive(!ccBtnActive));
  }, [dispatch, ccBtnActive]);

  useEffect(() => {
    hotkeys.filter = function () {
      return true;
    };
    hotkeys(getShortcutKeys().END_CALL, (e, handler) => {
      e.preventDefault();
      dispatch(endCall());
      keyShortcutsLog(`Key pressed - ${handler.key}`);
      dispatch(googleAnalytics.keyboardShortcuts("END_CALL"));
    });
    return () => {
      hotkeys.unbind(getShortcutKeys().END_CALL);
    };
  }, [dispatch]);

  useEffect(() => {
    hotkeys.filter = function () {
      return true;
    };
    hotkeys(getShortcutKeys().TOOGLE_CC, (e, handler) => {
      e.preventDefault();
      onCcClick();
      keyShortcutsLog(`Key pressed - ${handler.key}`);
      dispatch(googleAnalytics.keyboardShortcuts("TOOGLE_CC"));
    });
    return () => {
      hotkeys.unbind(getShortcutKeys().TOOGLE_CC);
    };
  }, [onCcClick, dispatch]);

  const rightButtonMobile = (
    <div className="right-button-mobile">
      <div className="more-button-header">{t("WB_TOOLTIP_MORE")}</div>
      {isShowRequestHelpButton && (
        <div
          className={
            `more-button-content  ${ccInProgress ? " disabled" : ""}` +
            Classes.POPOVER_DISMISS
          }
          {...test("BR_REQUEST_HELP_BUTTON_MOBILE")}
          onClick={raiseHandButtonClickHandler}
        >
          <button
            className={`raise-hand-button ${
              breakoutRooms.raiseHandButtonActive ? "active" : ""
            } ${breakoutRooms.raiseHandRequestInProgres ? " disabled" : ""}`}
            {...test("BR_REQUEST_HELP_BUTTON")}
            aria-label={
              breakoutRooms.raiseHandButtonActive
                ? t("CANCEL_REQUEST_HELP")
                : t("REQUEST_HELP")
            }
          />
          <span className="caption-button-label">{t("REQUEST_HELP")}</span>
        </div>
      )}
      {isCCEnabled && (
        <div
          className={
            `more-button-content  ${ccInProgress ? " disabled" : ""}` +
            Classes.POPOVER_DISMISS
          }
          {...test("СС_BUTTON_MOBILE")}
          onClick={onCcClick}
        >
          <button
            aria-label={t("CLOSED_CAPTION") + `${ccBtnActive ? " " : ""}`}
            aria-pressed={ccBtnActive ? true : false}
            className={`caption-button${ccBtnActive ? " active" : ""} ${
              ccInProgress ? " disabled" : ""
            }`}
            {...test("CAPTION_BUTTON")}
          />
          <span className="caption-button-label">{t("CLOSE_CAPTION")}</span>
        </div>
      )}
      {showInviteButton && (
        <div
          className={"more-button-content " + Classes.POPOVER_DISMISS}
          onClick={toggleInviteToCallPopup}
        >
          {" "}
          <InviteToCallButton aria-label={t("INVITE_PARTICIPANT_TO_CALL")} />
          <span>{t("INVITE")}</span>
        </div>
      )}
      {!dataForAudioVideoContent && <ShareButton label={t("SHARE")} />}
      <ChatToggle
        isChatOpen={isChatOpen}
        onClick={toggleChat}
        label={t("CHAT")}
      />
    </div>
  );

  const rightButton = (
    <React.Fragment>
      {isShowRequestHelpButton && (
        <Tooltip
          content={
            breakoutRooms.raiseHandButtonActive
              ? t("CANCEL_REQUEST_HELP")
              : t("REQUEST_HELP")
          }
          disabled={isTouchScreen}
          position={Position.TOP}
          portalClassName="device-tooltip"
          {...test("BR_REQUEST_HELP_TOOLTIP")}
        >
          <button
            className={`raise-hand-button ${
              breakoutRooms.raiseHandButtonActive ? "active" : ""
            } ${breakoutRooms.raiseHandRequestInProgres ? " disabled" : ""}`}
            {...test("BR_REQUEST_HELP_BUTTON")}
            onClick={raiseHandButtonClickHandler}
            aria-label={
              breakoutRooms.raiseHandButtonActive
                ? t("CANCEL_REQUEST_HELP")
                : t("REQUEST_HELP")
            }
          />
        </Tooltip>
      )}
      {isCCEnabled && (
        <Tooltip
          content={CLOSED_CAPTION}
          disabled={isTouchScreen}
          position={Position.TOP}
          portalClassName="device-tooltip"
          {...test("CLOSED_CAPTION_TOOLTIP")}
        >
          <button
            aria-label={t("CLOSED_CAPTION") + `${ccBtnActive ? " " : ""}`}
            aria-pressed={ccBtnActive ? true : false}
            className={`caption-button ${ccBtnActive ? "active" : ""} ${
              ccInProgress ? " disabled" : ""
            }`}
            {...test("CAPTION_BUTTON")}
            onClick={onCcClick}
          />
        </Tooltip>
      )}
      {showInviteButton && (
        <Tooltip
          content={INVITE_TO_CALL}
          disabled={isTouchScreen}
          position={Position.TOP}
          portalClassName="device-tooltip"
          {...test("INVITE_TO_CALL_TOOLTIP")}
        >
          <InviteToCallButton
            aria-label={t("INVITE_PARTICIPANT_TO_CALL")}
            onClick={toggleInviteToCallPopup}
          />
        </Tooltip>
      )}
      {!dataForAudioVideoContent && (
        <Tooltip
          content={t("SHARE_APPLICATIONS")}
          disabled={isTouchScreen}
          position={Position.TOP}
          portalClassName="device-tooltip"
          {...test("SHARE_APPLICATIONS_TOOLTIP")}
        >
          <ShareButton />
        </Tooltip>
      )}
      <Tooltip
        content={IN_CALL_CHAT}
        disabled={isTouchScreen}
        position={Position.TOP}
        portalClassName="device-tooltip"
        {...test("IN_CALL_CHAT_TOOLTIP")}
      >
        <ChatToggle isChatOpen={isChatOpen} onClick={toggleChat} />
      </Tooltip>
    </React.Fragment>
  );

  return (
    !isWebViewEnabled && (
      <>
        {ccBtnActive && <ClosedCaptions />}
        <div className="call-controls">
          <div className="left-side-controls">
            <Tooltip
              content={LEAVE_THE_CALL}
              disabled={isTouchScreen}
              position={Position.TOP}
              portalClassName="device-tooltip"
            >
              <Button
                aria-label={t("LEAVE_THE_CALL")}
                className="end-call-button"
                {...test("END_CALL_BUTTON")}
                onClick={handleEndCallClick}
              />
            </Tooltip>
          </div>

          <div className="main-controls">
            <div className="main-controls-block-left">
              <SpeakerToggle isHotkeyEnable={true} />
              <MicrophoneToggle isHotkeyEnable={true} />
            </div>
            <div className="main-controls-block-right">
              <CameraToggle isHotkeyEnable={true} />
              {(isMobileSafari || isAndroid || isMobileDimension) && (
                <FlipCameraButton />
              )}
            </div>
          </div>

          <div className="right-side-controls">
            {mobilePortrait && showMoreButton() ? (
              <Popover
                popoverClassName="more-button-popover"
                content={rightButtonMobile}
                placement="top-end"
                captureDismiss={true}
              >
                <button
                  aria-label={t("WB_TOOLTIP_MORE")}
                  aria-haspopup="menu"
                  className="more-button"
                ></button>
              </Popover>
            ) : (
              rightButton
            )}
          </div>
        </div>
      </>
    )
  );
};

export default memo(Footer);
