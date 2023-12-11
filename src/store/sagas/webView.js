import { eventChannel } from "redux-saga";
import { put, take, select, call, takeLatest } from "redux-saga/effects";
import { guid } from "utils/helpers";
import * as devicesActions from "../actions/devices";

let volumeLevel = 100;
let clientId = "c6e6a645-eaa1-4308-9d34-3e7d0f38b7bd";
let correlationId = guid();

const properties = {
  AUDIO_INPUT_STATE: "AUDIO_INPUT_STATE",
  AUDIO_OUTPUT_STATE: "AUDIO_OUTPUT_STATE",
  AUDIO_OUTPUT_VOLUME: "AUDIO_OUTPUT_VOLUME",
};

const deviceStates = {
  UNMUTED: "UNMUTED",
  MUTED: "MUTED",
};

const createStateUpdateMessage = ({
  integrationState,
  isSpeakerTurnedOn,
  isMicrophoneTurnedOn,
  volumeLevel,
}) => {
  const msg = {
    data: [
      {
        property: properties.AUDIO_INPUT_STATE,
        value: isMicrophoneTurnedOn ? deviceStates.UNMUTED : deviceStates.MUTED,
      },
      {
        property: properties.AUDIO_OUTPUT_STATE,
        value: isSpeakerTurnedOn ? deviceStates.UNMUTED : deviceStates.MUTED,
      },
      {
        property: properties.AUDIO_OUTPUT_VOLUME,
        value: volumeLevel,
      },
    ],
    type: "epic.current_state_update",
    integrationState,
    correlationId,
    clientId,
  };
  console.log("WebView: app state update message", msg);
  return JSON.stringify(msg);
};

function sendInitRequest(isSpeakerTurnedOn, isMicrophoneTurnedOn, volumeLevel) {
  const initMessage = {
    type: "epic.initialize",
    correlationId,
    clientId,
  };
  console.log("WebView: initializing message", initMessage);

  window.chrome.webview.postMessage(JSON.stringify(initMessage));
  window.chrome.webview.postMessage(
    createStateUpdateMessage({
      integrationState: "INITIALIZING",
      isSpeakerTurnedOn,
      isMicrophoneTurnedOn,
      volumeLevel,
    })
  );
  window.chrome.webview.postMessage(
    createStateUpdateMessage({
      integrationState: "INTEGRATED",
      isSpeakerTurnedOn,
      isMicrophoneTurnedOn,
      volumeLevel,
    })
  );
}

// allows to get state of audio devices from Epic Monitor
// posible properties described in "properties" variable
function sendPropertyRequest(property) {
  const message = {
    type: "epic.request",
    correlationId,
    clientId,
    property,
  };

  console.log("WebView: property request message", message);

  window.chrome.webview.postMessage(JSON.stringify(message));
}

function* getWebViewSate() {
  try {
    yield call(sendPropertyRequest, properties.AUDIO_INPUT_STATE);
    yield call(sendPropertyRequest, properties.AUDIO_OUTPUT_STATE);
  } catch (e) {
    console.error("WebView: Get devices state error", e);
  }
}

function* initializeWebView(action) {
  try {
    const { devices, config } = yield select();
    const { isMicrophoneTurnedOn, isSpeakerTurnedOn } = devices;
    const { urlEpicClientId } = config;

    if (urlEpicClientId?.value) {
      clientId = urlEpicClientId?.value;
    }

    yield call(sendInitRequest, isSpeakerTurnedOn, isMicrophoneTurnedOn, 100);

    const webViewChanel = yield call(createWebViewChanel);
    yield takeLatest(webViewChanel, handleWebViewMessages);
  } catch (e) {
    console.log("WebView: Initialize error", e);
  }
}

function createWebViewChanel() {
  return eventChannel((emit) => {
    window.chrome.webview.addEventListener("message", emit);
    return () => {
      window.chrome.webview.removeEventListener("message", emit);
    };
  });
}

function* handleWebViewMessages(event) {
  console.log("WebView: message from Monitor", event.data);
  try {
    if (event.data.type === "epic.command") {
      const { correlationId: newCorelationId, data, command } = event.data;
      correlationId = newCorelationId;
      const property = command?.split("SET_")[1];
      const response = {
        type: "epic.command_response",
        property: property,
        value: data,
        correlationId,
        clientId,
      };
      const responseJSON = JSON.stringify(response);

      console.log("WebView: app response for epic.command", response);

      yield window.chrome.webview.postMessage(responseJSON);

      switch (command) {
        case "SET_AUDIO_INPUT_STATE": {
          if (data === deviceStates.MUTED) {
            yield put(devicesActions.microphoneTurnOff());
            yield take(`${devicesActions.microphoneTurnOff().type}_SUCCEEDED`);
          }
          if (data === deviceStates.UNMUTED) {
            yield put(devicesActions.microphoneTurnOn());
            yield take(`${devicesActions.microphoneTurnOn().type}_SUCCEEDED`);
          }
          break;
        }
        case "SET_AUDIO_OUTPUT_STATE": {
          if (data === deviceStates.MUTED) {
            yield put(devicesActions.speakerTurnOff());
            yield take(`${devicesActions.speakerTurnOff().type}_SUCCEEDED`);
          }
          if (data === deviceStates.UNMUTED) {
            yield put(devicesActions.speakerTurnOn());
            yield take(`${devicesActions.speakerTurnOn().type}_SUCCEEDED`);
          }
          break;
        }
        case "SET_AUDIO_OUTPUT_VOLUME": {
          volumeLevel = data;
          break;
        }
        default:
          break;
      }

      const { isMicrophoneTurnedOn, isSpeakerTurnedOn } = yield select(
        (state) => state.devices
      );

      window.chrome.webview.postMessage(
        createStateUpdateMessage({
          integrationState: "INTEGRATED",
          isSpeakerTurnedOn,
          isMicrophoneTurnedOn,
          volumeLevel,
        })
      );
    }
    if (event.data.type === "epic.request_response") {
      const { correlationId: newCorelationId, value, property } = event.data;
      correlationId = newCorelationId;
      switch (property) {
        case "AUDIO_INPUT_STATE": {
          if (value === deviceStates.MUTED) {
            yield put(devicesActions.microphoneTurnOff());
            yield take(`${devicesActions.microphoneTurnOff().type}_SUCCEEDED`);
          }
          if (value === deviceStates.UNMUTED) {
            yield put(devicesActions.microphoneTurnOn());
            yield take(`${devicesActions.microphoneTurnOn().type}_SUCCEEDED`);
          }
          break;
        }
        case "AUDIO_OUTPUT_STATE": {
          if (value === deviceStates.MUTED) {
            yield put(devicesActions.speakerTurnOff());
            yield take(`${devicesActions.speakerTurnOff().type}_SUCCEEDED`);
          }
          if (value === deviceStates.UNMUTED) {
            yield put(devicesActions.speakerTurnOn());
            yield take(`${devicesActions.speakerTurnOn().type}_SUCCEEDED`);
          }
          break;
        }
        case "AUDIO_OUTPUT_VOLUME": {
          volumeLevel = +value;
          break;
        }
        default:
          break;
      }
    }
  } catch (error) {
    console.log("WebView: handleWebViewMessages error", error);
  } finally {
  }
}

function* actionWatcher() {
  yield takeLatest("WEBVIEW_INITIALIZE", initializeWebView);
  yield takeLatest("GET_WEBVIEW_STATE", getWebViewSate);
}

export default actionWatcher;
