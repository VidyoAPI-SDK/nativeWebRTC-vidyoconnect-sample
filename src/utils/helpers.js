import storage from "./storage";

export function getInitials(string) {
  if (!string) {
    return "??";
  }
  return string
    .split(" ")
    .map((i) => i[0])
    .join("")
    .substr(0, 2)
    .toUpperCase();
}

export function arrayGroupBy(array, predicate) {
  return array.reduce((groups, item, i, self) => {
    self[i - 1] && predicate(self[i - 1] || item, item)
      ? groups[groups.length - 1].push(self[i])
      : groups.push([self[i]]);
    return groups;
  }, []);
}

export function unsafeParseTextFromHTMLString(htmlString) {
  let parser = new DOMParser();
  let parsedHTMLDoc = parser.parseFromString(htmlString, "text/html");

  let plainTextResult = parsedHTMLDoc.body.innerText;
  plainTextResult = plainTextResult.replace(/\n{3,}/gim, "\n\n");
  return plainTextResult;
}

export function encodeHTMLString(str) {
  let span = document.createElement("span");
  span.textContent = str;
  return span.innerHTML;
}

export function test(key) {
  return {
    "data-test-id": key,
  };
}

export function sortDevices(devices) {
  const sorted = [];
  let sysDefault;

  devices.forEach((item, index) => {
    if (item.id === "default") {
      sysDefault = item;
    } else {
      sorted.push(item);
    }
  });

  sorted.sort((item1, item2) => item1.name.localeCompare(item2.name));

  return sysDefault ? [sysDefault, ...sorted] : sorted;
}

export function getUserInitials(name) {
  let initials = "";
  const words = (name || "").split(" ");
  if (words.length >= 2) {
    initials = words[0].charAt(0) + words[1].charAt(0);
  } else {
    initials = words[0].charAt(0);
  }

  return initials.toLocaleUpperCase();
}

export function getFormattedString(string) {
  let args = Array.prototype.slice.call(arguments, 1);
  args.forEach(function (argument, i) {
    string = string.replace("${" + i + "}", argument || "");
  });
  return string;
}

export function takeVideoSnapShot(videoElement) {
  var canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  //convert to desired file format
  var dataURI = canvas.toDataURL("image/jpeg");
  console.log("Video snapShot data is ", dataURI);
  return dataURI;
}

export function saveDoNotShowMessage(name) {
  let doNotShowAgain = storage.getItem("doNotShowAgain");

  if (doNotShowAgain && Array.isArray(doNotShowAgain)) {
    doNotShowAgain.indexOf(name) === -1 && doNotShowAgain.push(name);
  } else {
    doNotShowAgain = [name];
  }

  storage.addItem("doNotShowAgain", doNotShowAgain);
}

export function isDoNotShowMessage(name) {
  const doNotShowAgain = storage.getItem("doNotShowAgain");

  if (doNotShowAgain && Array.isArray(doNotShowAgain)) {
    return doNotShowAgain.indexOf(name) !== -1;
  }
}

export function b64toBlob(dataURI) {
  var byteString = atob(dataURI.split(",")[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);

  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: "image/jpeg" });
}

export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}

export function isCustomParamEnabled(param) {
  return ["1", "true"].includes(param);
}

export function replaceInJson(json, replacements) {
  let string = JSON.stringify(json);
  for (let search in replacements) {
    string = string.replaceAll(search, replacements[search]);
  }
  return JSON.parse(string);
}

export function getPortalRefreshTokenUrl(portal) {
  const _portal = portal || storage.getItem("user")["portal"] || {};
  return `${_portal}/api/v1/refreshToken`;
}

/**
 *
 * @param {VidyoLocalMicrophone} microphone
 */
export function isStethoscope(microphone) {
  if (Array.isArray(window.appConfig?.STETHOSCOPE_DEVICE_NAMES)) {
    return window.appConfig.STETHOSCOPE_DEVICE_NAMES.some((name) =>
      microphone?.name.toString().includes(name)
    );
  }
}

/**
 *
 * @param {window1.document} sourceDoc
 * @param {window2.document} targetDoc
 *
 * This function copies styles from one window.document to another window2.document(new window)
 *
 * When use React.CreatePortal and target is a new window we don't have styles in this window, so we need to copy them
 */
export function copyStyles(sourceDoc, targetDoc) {
  Array.from(sourceDoc.styleSheets).forEach((styleSheet) => {
    try {
      if (styleSheet.cssRules) {
        const newStyleEl = sourceDoc.createElement("style");

        Array.from(styleSheet.cssRules).forEach((cssRule) => {
          newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
        });

        targetDoc.head.appendChild(newStyleEl);
      } else {
        const newLinkEl = sourceDoc.createElement("link");

        newLinkEl.rel = "stylesheet";
        newLinkEl.href = styleSheet.href;
        targetDoc.head.appendChild(newLinkEl);
      }
    } catch (e) {
      console.log(`Error while copy styles ${e}`);
    }
  });
}

/**
 * Simple helper to avoid sending unnecessary requests.
 *
 * Helpful if u have requests with JWT token that can be refreshed.
 * Is some cases, when JWT token was updated and your request is in "retry" mode, new request can be sended because of depends on JWT token.
 * Using this hook u can save this request in the queue and check if it in-progress now and prevent duplicating
 *
 * NOTE: Don't use it if you request might be send few times in parallel, it will allow only first request.
 */
const requestsInProgress = new Set();
export function useRequestsInProgress() {
  const isRequestInProgress = (request) => requestsInProgress.has(request);
  const addRequestInProgress = (request) => requestsInProgress.add(request);
  const deleteRequestInProgress = (request) =>
    requestsInProgress.delete(request);

  return [isRequestInProgress, addRequestInProgress, deleteRequestInProgress];
}
