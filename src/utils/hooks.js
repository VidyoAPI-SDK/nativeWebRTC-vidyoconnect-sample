import React from "react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import i18n from "translations/i18n";
import { useSelector } from "react-redux";
import showNotification from "components/Notifications";
import participantJoinedIcon from "assets/images/notifications/joined_call.svg";
import participantLeftIcon from "assets/images/notifications/left_call.svg";
import { unsafeParseTextFromHTMLString, getFormattedString } from "./helpers";
import { getCallAPIProvider } from "services/CallAPIProvider";
import logger from "utils/logger";

export function useIsTouchScreen() {
  const [isTouchScreen, setIsTouchScreen] = useState(false);

  const handleMediaQueryChange = (matches) => {
    setIsTouchScreen(matches);
  };

  const isTouchScreenQuery = useMediaQuery(
    { query: "(hover: none) and (pointer: coarse)" },
    undefined,
    handleMediaQueryChange
  );

  useEffect(() => {
    setIsTouchScreen(isTouchScreenQuery);
  }, [isTouchScreenQuery, isTouchScreen]);

  return isTouchScreen;
}

export function useTabletDimension() {
  const [isTablet, setIsTablet] = useState(false);

  const handleMediaQueryChange = (matches) => {
    setIsTablet(matches);
  };

  // Uses 845px beacause we change in-call layout CSS at this breakpoint
  const isMobileQuery = useMediaQuery(
    { query: "(max-width: 845px)" },
    undefined,
    handleMediaQueryChange
  );

  useEffect(() => {
    setIsTablet(isMobileQuery);
  }, [isMobileQuery, isTablet]);

  return [isTablet];
}

export function useMobileDimension() {
  const [isMobile, setIsMobile] = useState(false);

  const handleMediaQueryChange = (matches) => {
    setIsMobile(matches);
  };

  const isMobileQuery = useMediaQuery(
    { query: "(max-width: 480px), (max-height: 480px)" },
    undefined,
    handleMediaQueryChange
  );

  const isPortrait = useMediaQuery({ orientation: "portrait" });

  useEffect(() => {
    setIsMobile(isMobileQuery);
  }, [isMobileQuery, isMobile]);

  return [isMobile, isPortrait];
}

export function useLanguageDirection() {
  const [direction, setDirection] = useState(i18n.dir());

  const onLanguageChange = useCallback(() => {
    setDirection(i18n.dir());
  }, []);

  useEffect(() => {
    i18n.on("languageChanged", onLanguageChange);
    return () => {
      i18n.off("languageChanged", onLanguageChange);
    };
  }, [onLanguageChange]);

  useEffect(() => {
    setDirection(i18n.dir());
  }, [direction]);

  return direction;
}

export function useVisibility() {
  let hidden, visibilityChange;

  if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  const [isHidden, setHidden] = useState(document[hidden]);
  const [visibility, setVisibility] = useState(document.visibilityState);

  const handleVisibilityChange = useCallback(() => {
    setVisibility(document.visibilityState);
    setHidden(document[hidden]);
    console.log(
      `Application visibility changed, aplicaton is ${
        document[hidden] ? "hidden" : "visible"
      }`
    );
  }, [hidden]);

  useEffect(() => {
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
    return () => {
      document.removeEventListener(visibilityChange, handleVisibilityChange);
    };
  }, [handleVisibilityChange, visibilityChange, hidden]);

  return [isHidden, visibility];
}

export function useWindowBlur() {
  const [isBlurred, setBlur] = useState(false);

  const handleWindowBlur = () => {
    setBlur(true);
    console.log(`Application tab lost focus`);
  };

  const handleWindowFocus = () => {
    setBlur(false);
    console.log(`Application tab in focus`);
  };

  useEffect(() => {
    window.addEventListener("focus", handleWindowFocus, false);
    window.addEventListener("blur", handleWindowBlur, false);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  return isBlurred;
}

export function useKeyboardShortcut(options, callback) {
  const [isLocked, setLock] = useState(false);
  const hotKeys = useMemo(() => Object.entries(options), [options]);

  const handleKeyDown = useCallback(
    (event) => {
      if (!isLocked && hotKeys.every(([key, value]) => event[key] === value)) {
        callback();
        setLock(true);
      }
    },
    [hotKeys, callback, isLocked]
  );

  const handleKeyUp = useCallback(() => {
    if (isLocked) {
      setLock(false);
    }
  }, [isLocked]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return [handleKeyDown, handleKeyUp];
}

export function useSystemDefaultName() {
  const { t } = useTranslation();

  return useCallback(
    (item) => (item.id === "default" ? t("SYSTEM_DEFAULT") : item.name),
    [t]
  );
}

export function useModerationStatuses() {
  const call = useSelector((state) => state.call);
  const user = useSelector((state) => state.user);

  const isUserRegistered = user.isRegistered;
  const isUserAdmin = (user.accountType || "").toLowerCase() === "admin";
  const isUserRoomOwner =
    user.userInfo?.entityID &&
    call.roomInfo?.ownerID &&
    user.userInfo?.entityID === call.roomInfo?.ownerID;
  const isRoomHasPin =
    call.roomInfo?.RoomMode?.hasModeratorPIN === "true" ||
    call.roomInfo?.RoomMode?.hasModeratorPIN === true;
  const isRoomLocked =
    call.roomInfo?.RoomMode?.isLocked === "true" ||
    call.roomInfo?.RoomMode?.isLocked === true;
  const isBecomeModerator = user.becomeModerator;

  return {
    isUserRegistered,
    isUserAdmin,
    isUserRoomOwner,
    isRoomHasPin,
    isRoomLocked,
    isBecomeModerator,
  };
}

export function useOrientation() {
  const getOrientation = () => {
    const screenOrientation =
      (window.screen.orientation || {}).type ||
      window.screen.mozOrientation ||
      window.screen.msOrientation;

    if (
      screenOrientation === "portrait-secondary" ||
      screenOrientation === "portrait-primary" ||
      window.matchMedia("(orientation: portrait)").matches
    ) {
      return "portrait";
    } else if (
      screenOrientation === "landscape-primary" ||
      screenOrientation === "landscape-secondary" ||
      window.matchMedia("(orientation: landscape)").matches
    ) {
      return "landscape";
    } else if (screenOrientation === undefined) {
      return false;
    }
  };

  const [orientation, setOrientation] = useState(getOrientation());

  useEffect(() => {
    function orientationChange() {
      setOrientation(getOrientation());
    }

    window.addEventListener("resize", orientationChange);

    return () => {
      window.removeEventListener("resize", orientationChange);
    };
  }, []);

  return [orientation];
}

export function useCurrentUser() {
  const call = useSelector((state) => state.call);

  return (call.participants.list || []).find((p) => p.isLocal);
}

export function useInsightServerUrl() {
  const customParameters = useSelector(
    (state) => state.config.customParameters
  );
  const statsServerUrl = useSelector(
    (state) =>
      state.config.urlStatsServer.value ||
      state.vc_advancedConfig?.statsServerUrl
  );

  return statsServerUrl || customParameters?.insightServerUrl;
}

export function useHTMLMessageFormatting() {
  const formatMessage = (messageBody) => {
    // http://, https://, ftp://
    const urlPattern =
      /\b(?:https?|ftp):\/\/[a-z0-9-+&@#/%?=~_|!:,.;()$*"']*[a-z0-9-+&@#/%=~_|]/gim;
    // www. without http:// or https://
    const pseudoUrlPattern = /(^|[^/])(www\.[\S]+(\b|$))/gim;

    const lineBreakPattern = /\u21B5|\n|\r/g;
    let replaced = messageBody
      .replace(urlPattern, "[:splt:][:href:]$&[:splt:]")
      .replace(pseudoUrlPattern, " [:splt:][:http:]$2[:splt:]")
      .replace(lineBreakPattern, " [:splt:][:br:][:splt:]");
    let stringArray = replaced.split("[:splt:]");
    let i = 0,
      totalStrings = stringArray.length;
    let element = [];
    for (i; i < totalStrings; i++) {
      let thisString = stringArray[i];
      if (thisString !== "") {
        let prefix = thisString.slice(0, 8);
        if (
          prefix === "[:href:]" ||
          prefix === "[:http:]" ||
          prefix === "[:mail:]"
        ) {
          const reference = {
            "[:href:]": "",
            "[:http:]": "http://",
            "[:mail:]": "mailto:",
          };
          thisString = thisString.replace(prefix, "");
          let anchorElement = (
            <a
              key={i}
              href={reference[prefix] + thisString}
              target="_blank"
              rel="noopener noreferrer"
              className="link-message"
            >
              {thisString}
            </a>
          );
          element.push(anchorElement);
        } else {
          let textElement = <span key={i}>{thisString}</span>;
          element.push(textElement);
        }
      }
    }
    return <React.Fragment>{element}</React.Fragment>;
  };

  return [formatMessage];
}

export const useShowJoinNotification = () => {
  const notificationJoinParticipantRef = useRef(null);
  const isJoinParticipantNotificationVisible = useRef(false);
  const numberOfParticipantNotificationClub = useRef(0);
  const { t } = useTranslation();
  const showJoinNotification = (participantName) => {
    if (isJoinParticipantNotificationVisible.current === false) {
      notificationJoinParticipantRef.current = showNotification("banner", {
        title: unsafeParseTextFromHTMLString(participantName),
        message: t("HAS_JOINED_THE_CONFERENCE"),
        icon: participantJoinedIcon,
        showFor: 2500,
        onDismiss: (didTimeoutExpire) => {
          isJoinParticipantNotificationVisible.current = false;
          numberOfParticipantNotificationClub.current = 0;
        },
      });
      isJoinParticipantNotificationVisible.current = true;
    } else {
      notificationJoinParticipantRef.current = showNotification("banner", {
        title: `${unsafeParseTextFromHTMLString(
          participantName
        )} ${getFormattedString(
          t("AND_MORE"),
          ++numberOfParticipantNotificationClub.current
        )}`,
        message: t("HAS_JOINED_THE_CONFERENCE"),
        icon: participantJoinedIcon,
        showFor: 2500,
        key: notificationJoinParticipantRef.current,
        onDismiss: (didTimeoutExpire) => {
          isJoinParticipantNotificationVisible.current = false;
          numberOfParticipantNotificationClub.current = 0;
        },
      });
    }
  };
  return [showJoinNotification];
};

export const useShowLeaveNotification = () => {
  const notificationLeaveParticipantRef = useRef(null);
  const isLeaveParticipantNotificationVisible = useRef(false);
  const numberOfParticipantLeaveNotificationClub = useRef(0);
  const { t } = useTranslation();
  const showLeaveNotification = (participantName) => {
    if (isLeaveParticipantNotificationVisible.current === false) {
      notificationLeaveParticipantRef.current = showNotification("banner", {
        title: unsafeParseTextFromHTMLString(participantName),
        message: t("LEFT_THE_CONFERENCE"),
        icon: participantLeftIcon,
        showFor: 2500,
        onDismiss: (didTimeoutExpire) => {
          isLeaveParticipantNotificationVisible.current = false;
          numberOfParticipantLeaveNotificationClub.current = 0;
        },
      });
      isLeaveParticipantNotificationVisible.current = true;
    } else {
      notificationLeaveParticipantRef.current = showNotification("banner", {
        title: `${unsafeParseTextFromHTMLString(
          participantName
        )} ${getFormattedString(
          t("AND_MORE"),
          ++numberOfParticipantLeaveNotificationClub.current
        )}`,
        message: t("LEFT_THE_CONFERENCE"),
        icon: participantLeftIcon,
        showFor: 2500,
        key: notificationLeaveParticipantRef.current,
        onDismiss: (didTimeoutExpire) => {
          isLeaveParticipantNotificationVisible.current = false;
          numberOfParticipantLeaveNotificationClub.current = 0;
        },
      });
    }
  };
  return [showLeaveNotification];
};

const ONLY_PARTICIPANT_CALL_END_TIME = 15;

export function useInactivityTimer(customParameters, participants, callback) {
  const inactivityTimer = customParameters?.InactivityTimer;
  const INACTIVITY_TIME_OUT =
    inactivityTimer / 60 || ONLY_PARTICIPANT_CALL_END_TIME;
  useEffect(() => {
    if (participants.list.length === 1) {
      let onlyParticipantLastTime = new Date().getTime();
      const interval = setInterval(() => {
        if (
          (new Date().getTime() - onlyParticipantLastTime) / 1000 / 60 >
          INACTIVITY_TIME_OUT
        ) {
          logger.warn(
            `User is alone in the call more than ${INACTIVITY_TIME_OUT} minutes. Exiting.`
          );
          getCallAPIProvider().exitAfterAloneInCall = true;
          callback();
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [participants, callback, INACTIVITY_TIME_OUT]);
}
