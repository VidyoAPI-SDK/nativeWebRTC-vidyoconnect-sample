import store, { sagaMiddleware } from "store/store";
import GlobalMessages from "./containers";
import reducer from "./reducer";
import saga from "./saga";

store.injectReducer("vc_globalMessages", reducer);
sagaMiddleware.run(saga);

export default GlobalMessages;
