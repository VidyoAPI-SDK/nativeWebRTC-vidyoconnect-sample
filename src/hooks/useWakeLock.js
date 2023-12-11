import { useEffect, useRef } from "react";
import logger from "utils/logger";
import { isChrome } from "react-device-detect";

const useWakeLock = () => {
  const WAKE_LOCK = useRef(null);

  const requestWakeLock = async () => {
    if (!isChrome) {
      return;
    }
    try {
      WAKE_LOCK.current = await navigator.wakeLock.request("screen");
      WAKE_LOCK.current.addEventListener("release", (e) => {
        logger.info("Wake Lock was released");
      });
      logger.info("Wake Lock is active");
    } catch (error) {
      logger.error(
        `error while activating wake lock ${error?.name}, ${error?.message}`
      );
    }
  };

  const handleVisibilityChange = () => {
    if (WAKE_LOCK.current !== null && document.visibilityState === "visible") {
      logger.info(
        "application visiblity changed so requesting wake lock again"
      );
      requestWakeLock();
    }
  };

  const revokeWakeLock = () => {
    if (!isChrome) {
      return;
    }
    if (WAKE_LOCK.current) {
      WAKE_LOCK.current.release();
      WAKE_LOCK.current = null;
    }
  };

  useEffect(() => {
    requestWakeLock();
    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      revokeWakeLock();
    };
    // eslint-disable-next-line
  }, []);
};
export default useWakeLock;
