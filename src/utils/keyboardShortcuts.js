import { keyboardShortcutWin, keyboardShortcutMac } from "./constants";
import { getFormattedString } from "./helpers";
import logger from "./logger";
export const getShortcutKeys = () => {
  if (navigator.userAgent.indexOf("Mac") !== -1) return keyboardShortcutMac;
  else return keyboardShortcutWin;
};

export function getShortcutKeysText(keyboardKeyText) {
  let args = Array.prototype.slice.call(arguments, 1);
  let keysList = [];
  keysList.push(keyboardKeyText);
  args.forEach(function (argument, i) {
    let string = argument.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
      return g1.toUpperCase() + g2.toLowerCase();
    });
    keysList.push(string);
  });
  return getFormattedString.apply(this, keysList);
}

export function keyShortcutsLog(text) {
  logger.info("KEYBOARD_SHORTCUTS:" + text);
}
