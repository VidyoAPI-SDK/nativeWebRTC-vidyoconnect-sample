import store, { sagaMiddleware } from "store/store";
import RoomLink from "./containers/RoomLink";
import AdHocRoomInfoDialog from "./containers/AdHocRoomInfoDialog";
import reducer from "./reducer";
import saga from "./saga";

store.injectReducer("vc_adHocRoom", reducer);
sagaMiddleware.run(saga);

export { RoomLink, AdHocRoomInfoDialog };
