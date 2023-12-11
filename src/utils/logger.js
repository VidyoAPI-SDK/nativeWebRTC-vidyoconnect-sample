import logger from "loglevel";
import prefix from "loglevel-plugin-prefix";

export const collectedLogs = [];

const URLParams = new URLSearchParams(document.location.search);
const offLogs = URLParams.get("offLogs");

prefix.reg(logger);
prefix.apply(logger, {
  template: "%l (%n):",
  levelFormatter(level) {
    return level.toUpperCase();
  },
  nameFormatter(name) {
    return name || "default";
  },
  timestampFormatter(date) {
    return date.toISOString();
  },
});

let factory = logger.methodFactory;
logger.methodFactory = function (methodName, logLevel, loggerName) {
  var rawMethod = factory(methodName, logLevel, loggerName);
  return function (message) {
    if (offLogs) return rawMethod(message);
    collectedLogs.push({
      type: methodName,
      datetime: new Date(),
      value: [message],
    });
    rawMethod(message);
  };
};

logger.enableAll();
logger.setLevel("info");

export default logger;

export function startCollectingConsoleLogs() {
  const defaultLog = console.log;
  const defaultError = console.error;
  const defaultWarn = console.warn;
  const defaultDebug = console.debug;
  const defaultInfo = console.info;

  window.console.log = function () {
    if (offLogs) return defaultLog.apply(window.console, arguments);
    collectedLogs.push({
      type: "log",
      datetime: new Date(),
      value: Array.from(arguments),
    });
    defaultLog.apply(window.console, arguments);
  };
  window.console.info = function () {
    if (offLogs) return defaultInfo.apply(window.console, arguments);
    collectedLogs.push({
      type: "info",
      datetime: new Date(),
      value: Array.from(arguments),
    });
    defaultInfo.apply(window.console, arguments);
  };
  window.console.error = function () {
    if (offLogs) return defaultError.apply(window.console, arguments);
    collectedLogs.push({
      type: "error",
      datetime: new Date(),
      value: Array.from(arguments),
    });
    defaultError.apply(window.console, arguments);
  };
  window.console.warn = function () {
    if (offLogs) return defaultWarn.apply(window.console, arguments);
    collectedLogs.push({
      type: "warn",
      datetime: new Date(),
      value: Array.from(arguments),
    });
    defaultWarn.apply(window.console, arguments);
  };
  window.console.debug = function () {
    if (offLogs) return defaultDebug.apply(window.console, arguments);
    collectedLogs.push({
      type: "debug",
      datetime: new Date(),
      value: Array.from(arguments),
    });
    defaultDebug.apply(window.console, arguments);
  };
}

export function logCallbacks(target = {}) {
  let context = target.context || "";
  delete target.context;
  Object.keys(target).forEach((k) => {
    if (typeof target[k] === "function") {
      let method = target[k];
      target[k] = function (...args) {
        let callbackName = `Callback ${context || ""} ${k}`;
        if (process.env.NODE_ENV === `development`) {
          console.log({ [callbackName]: args });
        } else {
          let simplifiedCallbacksLog = `${callbackName}${
            args?.[0]?.name ? `, name: ${args[0].name}` : ""
          }`;
          if (context.includes("Remote")) {
            simplifiedCallbacksLog += args?.[1]?.name
              ? `, participant: ${args[1].name}`
              : "";
            if (k === "onStateUpdated") {
              simplifiedCallbacksLog += args?.[2] ? `, state: ${args[2]}` : "";
            }
          } else if (context.includes("Local") && k === "onStateUpdated") {
            simplifiedCallbacksLog += args?.[1] ? `, state: ${args[1]}` : "";
          } else if (context === "ConnectToRoomAsGuest") {
            simplifiedCallbacksLog += args?.[0] ? `, reason: ${args[0]}` : "";
          }
          console.log(simplifiedCallbacksLog);
        }
        method(...args);
      };
    }
  });
  return target;
}

export class Logger {
  constructor(prefix) {
    let prefixText = prefix ? prefix + ": " : "";
    this.log = (message) => {
      console.log(prefixText + message);
    };
    this.logInfo = (message) => {
      console.info(prefixText + message);
    };
    this.logDebug = function (message) {
      console.debug(prefixText + message);
    };
    this.logWarning = function (message) {
      console.warn(prefixText + message);
    };
    this.logError = function (message) {
      console.error(prefixText + message);
    };
  }
}

export const customSimpleReduxLoggeer = (store) => (next) => (action) => {
  console.log(`Action: ${action.type}`);
  return next(action);
};
