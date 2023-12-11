import { all } from "redux-saga/effects";
import camerasActionWatcher from "./devices/cameras";
import microphonesActionWatcher from "./devices/microphones";
import speakersActionWatcher from "./devices/speakers";
import chatActionWatcher from "./chat";
import callActionWatcher from "./call";
import appActionWatcher from "./app";
import userActionWatcher from "./user";
import configActionWatcher from "./config";
import webViewActionWatcher from "./webView";

function* devicesActionWatcher() {
  yield all([
    camerasActionWatcher(),
    microphonesActionWatcher(),
    speakersActionWatcher(),
  ]);
}

export default function* rootSaga() {
  yield all([
    appActionWatcher(),
    chatActionWatcher(),
    callActionWatcher(),
    devicesActionWatcher(),
    configActionWatcher(),
    userActionWatcher(),
    webViewActionWatcher(),
  ]);
}
