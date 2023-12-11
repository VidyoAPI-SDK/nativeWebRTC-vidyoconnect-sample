import { UAParser, DEVICE } from "ua-parser-js";
const { isTablet } = require("react-device-detect");

class OperatingSystemInfoProvider {
  static _isAndroidTablet;
  static _UAParserData = new UAParser().getResult();

  static _checkAndroid() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTablet =
      /(android(?!.*mobile))/.test(userAgent) ||
      (OperatingSystemInfoProvider._UAParserData?.device?.type ===
        DEVICE.TABLET &&
        OperatingSystemInfoProvider._UAParserData?.os?.name?.toLowerCase() ===
          "android");
    if (isTablet) {
      OperatingSystemInfoProvider._isAndroidTablet = true;
    } else {
      OperatingSystemInfoProvider._isAndroidTablet = false;
    }
  }

  static IsIPadOS() {
    const TouchScreenPoints = 2;
    return (
      /iPad/.test(navigator.userAgent) ||
      (navigator.maxTouchPoints &&
        navigator.maxTouchPoints > TouchScreenPoints &&
        /Macintosh/.test(navigator.userAgent))
    );
  }

  static IsAndroidTablet() {
    if (OperatingSystemInfoProvider._isAndroidTablet === undefined) {
      OperatingSystemInfoProvider._checkAndroid();
    }
    return OperatingSystemInfoProvider._isAndroidTablet;
  }

  static IsTabletDevice() {
    return (
      isTablet ||
      OperatingSystemInfoProvider.IsAndroidTablet() ||
      OperatingSystemInfoProvider.IsIPadOS()
    );
  }
}

export default OperatingSystemInfoProvider;
