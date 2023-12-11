import configureStore, { sagaMiddleware } from "./configureStore";

const store = configureStore();

export { sagaMiddleware };
export default store;
