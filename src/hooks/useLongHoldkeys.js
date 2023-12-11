import { useCallback, useEffect, useRef } from "react";
import logger from "utils/logger";
/***
 * Keys - it is keyboard key use to execution
 * isTurnedOn - To know the status
 * turnOn - Function to run Turn On
 * turnOff - Function to run Turn Off
 * isEnabled - to enable the pluggin
 */
const useLongHoldkeys = (
  keys,
  isTurnedOn,
  turnOn,
  turnOff,
  isEnabled = true
) => {
  const isRepeat = useRef(false);
  const keyCodeTyped = useRef({});
  const keysList = keys.split("+");

  const iskeyCodeTyped = useCallback(() => {
    const keyboardKeys = { ctrl: "17", space: "32", meta: "91", alt: "18" }; // Todo - Need to add keyboard
    for (const key in keysList) {
      let val = keysList[key];
      if (!keyCodeTyped.current[keyboardKeys[val]]) {
        return false;
      }
    }
    return true;
  }, [keysList]);

  const filter = (event) => {
    let target = event.target || event.srcElement;
    let tagName = target.tagName;
    if (
      target.isContentEditable ||
      ((tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT") &&
        !target.readOnly)
    ) {
      return false;
    }
    return true;
  };

  const keyDownHandled = useCallback(
    (event) => {
      keyCodeTyped.current[event.keyCode] = true;
      if (filter(event) === true) event.preventDefault();
      if (isEnabled === false) return;
      if (isTurnedOn) return;
      if (iskeyCodeTyped() === true) {
        if (isRepeat.current === false) {
          /**Check to avoid repeat execution */
          isRepeat.current = true;
          turnOn();
          logger.info("LONG HOLD KEYS: turnOn");
        }
      }
    },
    [turnOn, keyCodeTyped, iskeyCodeTyped, isEnabled, isTurnedOn]
  );

  const keyUpHandled = useCallback(
    (event) => {
      logger.info("LONG HOLD KEYS: keyUpHandled - " + event.code);
      keyCodeTyped.current[event.keyCode] = false;
      if (filter(event) === true) event.preventDefault();
      if (isRepeat.current === false) return;
      if (isEnabled === false) return;
      if (iskeyCodeTyped() === false) {
        setTimeout(() => {
          isRepeat.current = false;
          turnOff();
          logger.info("LONG HOLD KEYS: turnOff");
        }, 100);
      }
    },
    [keyCodeTyped, iskeyCodeTyped, isRepeat, turnOff, isEnabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", keyDownHandled);
    document.addEventListener("keyup", keyUpHandled);
    return () => {
      document.removeEventListener("keydown", keyDownHandled);
      document.removeEventListener("keyup", keyUpHandled);
    };
  }, [keyDownHandled, keyUpHandled]);
};
export default useLongHoldkeys;
