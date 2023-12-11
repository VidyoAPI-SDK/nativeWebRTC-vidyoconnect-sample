import React, { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Position, Tooltip, Icon } from "@blueprintjs/core";
import {
  getLeftPaneltoggle,
  getCustomParameters,
} from "store/selectors/config";
import { getBreakoutRooms } from "store/selectors/features";
import { RoomLink } from "containers/RoomLink/RoomLink";
import { VidyoConnector } from "features";
import SecureConnectionStatus from "containers/SecureConnectionStatus/SecureConnectionStatus";
import RecorderStatus from "containers/RecorderStatus/RecorderStatus";
import CallQualityIndicator from "containers/CallQualityIndicator/CallQualityIndicator";
import SettingsButton from "components/SettingsButton/SettingsButton";
import { test } from "utils/helpers";
import { useIsTouchScreen, useMobileDimension } from "utils/hooks";
import OperatingSystemInfoProvider from "utils/deviceDetect";
import { isMobile } from "react-device-detect";
import * as googleAnalytics from "store/actions/googleAnalytics";
import hotkeys from "hotkeys-js";
import {
  getShortcutKeys,
  getShortcutKeysText,
  keyShortcutsLog,
} from "utils/keyboardShortcuts";

const Header = ({
  isSidebarOpen,
  toggleSidebar,
  callName,
  toggleSettings,
  participantsLength,
  isWebViewEnabled,
  pressAdhocRoomInfo
}) => {
  const { t } = useTranslation();
  const leftPanelToggle = useSelector(getLeftPaneltoggle);
  const breakoutRooms = useSelector(getBreakoutRooms);
  const customParameters = useSelector(getCustomParameters);
  const [isMobileDimension] = useMobileDimension();
  const isTouchScreen =
    useIsTouchScreen() ||
    isMobile ||
    OperatingSystemInfoProvider.IsTabletDevice();

  const isCallQualityIndicatorEnabled =
    customParameters?.callQualityIndicatorEnabled === "1";

  const PARTICIPANTS = getShortcutKeysText(
    t("SHORTCUT_PARTICIPANTS"),
    getShortcutKeys().TOOGLE_SIDE_PANEL
  );

  const dispatch = useDispatch();

  useEffect(() => {
    hotkeys.filter = function () {
      return true;
    };
    hotkeys(getShortcutKeys().TOOGLE_SIDE_PANEL, (e, handler) => {
      e.preventDefault();
      toggleSidebar();
      keyShortcutsLog(`Key pressed - ${handler.key}`);
      dispatch(googleAnalytics.keyboardShortcuts("TOOGLE_SIDE_PANEL"));
    });
    return () => {
      hotkeys.unbind(getShortcutKeys().TOOGLE_SIDE_PANEL);
    };
  }, [toggleSidebar, dispatch]);

  return (
    <>
      {isWebViewEnabled ? (
        <div className="header">
          {leftPanelToggle && (
            <div
              role="button"
              aria-label={t("PARTICIPANTS_LIST_TOGGLE")}
              aria-expanded={isSidebarOpen ? "true" : "false"}
              className={`side-bar-toggle ${isSidebarOpen ? "close" : ""}`}
              {...test("ROSTER_BUTTON")}
              onClick={toggleSidebar}
            ></div>
          )}
        </div>
      ) : (
        <div className="header">
          <Tooltip
            content={PARTICIPANTS}
            position={Position.RIGHT}
            disabled={isTouchScreen}
            portalClassName="device-tooltip"
          >
            <div
              role="button"
              aria-label={t("PARTICIPANTS_LIST_TOGGLE")}
              aria-expanded={isSidebarOpen ? "true" : "false"}
              className={`side-bar-toggle ${isSidebarOpen ? "close" : ""}`}
              {...test("ROSTER_BUTTON")}
              onClick={toggleSidebar}
              hidden={!leftPanelToggle}
            ></div>
          </Tooltip>
          <div
            className="participants-count"
            role="alert"
            aria-live="polite"
            aria-relevant="all"
            tabIndex="0"
            aria-label={
              t("PARTICIPANTS_NUMBER") + ": " + (participantsLength || 1)
            }
            {...test("PARTICIPANTS_AMOUNT")}
          >
            <span aria-hidden>{participantsLength || 1}</span>
          </div>
          <div
            tabIndex="0"
            aria-label={`${t("CONFERENCE")}: ${
              breakoutRooms.isRoomBreakout
                ? breakoutRooms.mainConferenceName + " - " + callName
                : callName
            }`}
            className="room-name"
            {...test("CONFERENCE_NAME")}
          >
            <span aria-hidden>
              {breakoutRooms.isRoomBreakout
                ? `${breakoutRooms.mainConferenceName} - ${callName}`
                : callName}
            </span>
          </div>
          <div className="header-section-right">
            {!isMobileDimension && (
                <Icon
                    icon="info-sign"
                    size={28}
                    onClick={() => pressAdhocRoomInfo()}
                />
            )}
            {!isMobileDimension &&
              (<VidyoConnector.AdHocRoom.RoomLink /> || <RoomLink />)}
            <SecureConnectionStatus />
            <RecorderStatus />
            {isCallQualityIndicatorEnabled && <CallQualityIndicator />}
            <SettingsButton toggleSettings={toggleSettings} />
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Header);
