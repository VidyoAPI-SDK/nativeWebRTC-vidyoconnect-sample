import { combineReducers } from "redux";

import appReducer from "./app";
import devicesReducer from "./devices";
import configReducer from "./config";
import callReducer from "./call";
import userReducer from "./user";
import chatReducer from "./chat";

const staticReducers = {
  app: appReducer,
  devices: devicesReducer,
  call: callReducer,
  user: userReducer,
  chat: chatReducer,
  config: configReducer,
};

export default function createReducer(asyncReducers = {}) {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers,
  });
}
