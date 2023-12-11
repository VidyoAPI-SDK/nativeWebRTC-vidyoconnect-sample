import store, { sagaMiddleware } from "store/store";
import reducer from "./reducer";
import saga from "./saga";
import WebBreakoutRooms from "./containers/WebBreakoutRooms";

store.injectReducer("feature_breakoutRooms", reducer);
sagaMiddleware.run(saga);

export default WebBreakoutRooms;
