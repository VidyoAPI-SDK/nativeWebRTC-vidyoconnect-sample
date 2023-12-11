import {
  Classes,
  showNotification,
  dismissNotification,
} from "components/Notifications";
import StethoscopeAvailableIcon from "assets/images/notifications/steth_available.svg";
import StethoscopeUnavailableIcon from "assets/images/notifications/steth_unavailable.svg";
import MicrophoneOffIcon from "assets/images/buttons/micControlOff.svg";
import { unselectLocalStethoscope } from "../actions/creators";
import { useDispatch, useSelector } from "react-redux";
import { getFormattedString } from "utils/helpers";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";

const DEFAULT_TIMEOUT = 3000;
const SHOW_ALWAYS = -1;

export default function useNotifications() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    localStethoscopes = [],
    remoteStethoscopes = [],
    isStethoscopeSupported,
    isRemoteStethoscopeStarted,
    isLocalStethoscopeStarted,
  } = useSelector((state) => state.feature_stethoscope);
  const prevStethoscopeSupportedRef = useRef(isStethoscopeSupported);
  const notificationRemoteStethoscopeInUseRef = useRef(null);
  const notificationLocalStethoscopeInUseRef = useRef(null);
  const detectedRemoteStethoscopesRef = useRef([]);
  const detectedLocalStethoscopesRef = useRef([]);

  useEffect(() => {
    const isStethoscopeAdded = localStethoscopes.some((localStethoscope) => {
      return detectedLocalStethoscopesRef.current.every(
        (stethoscope) => stethoscope.id !== localStethoscope.id
      );
    });
    if (isStethoscopeAdded) {
      showNotification("banner", {
        icon: StethoscopeAvailableIcon,
        className: Classes.UNDISMISSABLE,
        message: t("YOUR_STETHOSCOPE_IS_CONNECTED"),
        showFor: DEFAULT_TIMEOUT,
      });
    }
    detectedLocalStethoscopesRef.current = localStethoscopes;
  }, [localStethoscopes, t]);

  useEffect(() => {
    remoteStethoscopes.forEach((remoteStethoscope) => {
      if (
        detectedRemoteStethoscopesRef.current.every(
          (stethoscope) => stethoscope.id !== remoteStethoscope.id
        )
      ) {
        showNotification("banner", {
          icon: StethoscopeAvailableIcon,
          className: Classes.UNDISMISSABLE,
          message: getFormattedString(
            t("STETHOSCOPE_FOR_CONNECTED"),
            remoteStethoscope.participant?.name || t("UNKNOWN")
          ),
          showFor: DEFAULT_TIMEOUT,
        });
      }
    });
    detectedRemoteStethoscopesRef.current.forEach((stethoscope) => {
      if (
        remoteStethoscopes.every(
          (remoteStethoscope) => remoteStethoscope.id !== stethoscope.id
        )
      ) {
        showNotification("banner", {
          icon: StethoscopeUnavailableIcon,
          className: Classes.UNDISMISSABLE,
          message: getFormattedString(
            t("STETHOSCOPE_FOR_DISCONNECTED"),
            stethoscope.participant?.name || t("UNKNOWN")
          ),
          showFor: DEFAULT_TIMEOUT,
        });
      }
    });
    detectedRemoteStethoscopesRef.current = remoteStethoscopes;
  }, [remoteStethoscopes, t]);

  useEffect(() => {
    if (isRemoteStethoscopeStarted) {
      if (notificationRemoteStethoscopeInUseRef.current === null) {
        notificationRemoteStethoscopeInUseRef.current = showNotification(
          "banner",
          {
            icon: MicrophoneOffIcon,
            className: Classes.UNDISMISSABLE,
            message: t("NOT_ABLE_HEAR_VOICE_WHILE_STETHOSCOPE"),
            showFor: SHOW_ALWAYS,
          }
        );
      } else {
        dismissNotification(notificationRemoteStethoscopeInUseRef.current);
        notificationRemoteStethoscopeInUseRef.current = showNotification(
          "banner",
          {
            icon: MicrophoneOffIcon,
            className: Classes.UNDISMISSABLE,
            message: t("NO_OTHER_AUDIO_WHILE_STETHOSCOPE"),
            showFor: SHOW_ALWAYS,
          }
        );
      }
    } else if (notificationRemoteStethoscopeInUseRef.current) {
      dismissNotification(notificationRemoteStethoscopeInUseRef.current);
    }
  }, [isRemoteStethoscopeStarted, t]);

  useEffect(() => {
    if (notificationLocalStethoscopeInUseRef.current) {
      dismissNotification(notificationLocalStethoscopeInUseRef.current);
      notificationLocalStethoscopeInUseRef.current = null;
    }
    if (isLocalStethoscopeStarted) {
      notificationLocalStethoscopeInUseRef.current = showNotification(
        "banner",
        {
          icon: MicrophoneOffIcon,
          className: Classes.UNDISMISSABLE,
          message: t("PRACTITIONER_NOT_HEAR_YOU_DUE_STETHOSCOPE"),
          showFor: SHOW_ALWAYS,
        }
      );
    }
  }, [isLocalStethoscopeStarted, t]);

  useEffect(() => {
    if (isStethoscopeSupported !== prevStethoscopeSupportedRef.current) {
      if (isStethoscopeSupported) {
        showNotification("banner", {
          icon: StethoscopeAvailableIcon,
          message: t("STETHOSCOPE_AUDIO_IS_AVAILABLE"),
          showFor: DEFAULT_TIMEOUT,
        });
      } else {
        showNotification("banner", {
          icon: StethoscopeUnavailableIcon,
          message: t("STETHOSCOPE_DISABLED_DUE_CONNECTION_ISSUE"),
          showFor: DEFAULT_TIMEOUT,
        });
        dispatch(unselectLocalStethoscope());
      }
      prevStethoscopeSupportedRef.current = isStethoscopeSupported;
    }
  }, [isStethoscopeSupported, dispatch, t]);
}
