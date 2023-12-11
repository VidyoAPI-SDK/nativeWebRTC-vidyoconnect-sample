import { BecomeModerator } from "containers/BecomeModerator/BecomeModerator";
import { OutlineButton } from "components/OutlineButton/OutlineButton";
import CallModeration from "containers/CallModeration/CallModeration";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { closeModerationPanel, openModerationPanel } from "store/actions/call";
import { test } from "utils/helpers";
import { useModerationStatuses, useTabletDimension } from "utils/hooks";
import * as googleAnalytics from "store/actions/googleAnalytics";
import hotkeys from "hotkeys-js";
import { getShortcutKeys, keyShortcutsLog } from "utils/keyboardShortcuts";
import "./SidebarModeratorControls.scss";

const SidebarModeratorControls = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isTablet] = useTabletDimension();
  const call = useSelector((state) => state.call);
  const user = useSelector((state) => state.user);

  const { isUserAdmin, isUserRoomOwner, isRoomHasPin } =
    useModerationStatuses();

  const onModerateCallClickHandler = useCallback(() => {
    isTablet
      ? call.moderationPanelOpened
        ? dispatch(closeModerationPanel())
        : dispatch(openModerationPanel())
      : dispatch(openModerationPanel());
  }, [call.moderationPanelOpened, dispatch, isTablet]);

  useEffect(() => {
    hotkeys.filter = function () {
      return true;
    };
    hotkeys(getShortcutKeys().TOOGLE_MODERATION_PANEL, (e, handler) => {
      e.preventDefault();
      onModerateCallClickHandler();
      keyShortcutsLog(`Key pressed - ${handler.key}`);
      dispatch(googleAnalytics.keyboardShortcuts("OPEN_MODERATION_PANEL"));
    });
    return () => {
      hotkeys.unbind(getShortcutKeys().TOOGLE_MODERATION_PANEL);
    };
  }, [dispatch, onModerateCallClickHandler]);

  if (!user.isRegistered) {
    return null;
  } else {
    if (!isUserAdmin && !isUserRoomOwner && !isRoomHasPin) {
      return null;
    }
  }

  return (
    <>
      <div className="call-m" {...test("SIDEBAR_MODERATION_BLOCK")}>
        <div className="call-m__mobile-moderation">
          {call.moderationPanelOpened && isTablet && <CallModeration />}
        </div>
        <div className="call-m__actions">
          {isUserAdmin || isUserRoomOwner ? (
            <OutlineButton
              testId={"OPEN_MODERATION_PANEL"}
              label={
                isTablet
                  ? call.moderationPanelOpened
                    ? t("CLOSE_MODERATE_CALL")
                    : t("MODERATE_CALL")
                  : t("MODERATE_CALL")
              }
              onClick={onModerateCallClickHandler}
            />
          ) : (
            <BecomeModerator />
          )}
        </div>
      </div>
    </>
  );
};

export default SidebarModeratorControls;
