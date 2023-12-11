import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { gaMiddleware } from "./analytics/googleAnalytics";
import createSagaMiddleware from "redux-saga";
import createReducer from "./reducers";
import rootSaga from "./sagas";
import { customSimpleReduxLoggeer } from "../utils/logger";

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(preloadedState = {}) {
  const middlewares = [gaMiddleware, sagaMiddleware];

  if (process.env.NODE_ENV === `development`) {
    const { createLogger } = require(`redux-logger`);
    const logger = createLogger({
      collapsed: true,
      // diff: true,
    });
    middlewares.push(logger);
  } else {
    middlewares.push(customSimpleReduxLoggeer);
  }

  const middlewareEnhancer = applyMiddleware(...middlewares);
  const enhancers = [middlewareEnhancer];

  const composedEnhancers = composeWithDevTools(...enhancers);

  const store = createStore(createReducer(), preloadedState, composedEnhancers);
  store.asyncReducers = {};

  store.injectReducer = (key, asyncReducer) => {
    store.asyncReducers[key] = asyncReducer;
    store.replaceReducer(createReducer(store.asyncReducers));
  };

  sagaMiddleware.run(rootSaga);

  return store;
}

export { sagaMiddleware };
