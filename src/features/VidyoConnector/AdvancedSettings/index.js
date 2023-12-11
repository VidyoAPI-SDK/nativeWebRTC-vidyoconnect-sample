import store, { sagaMiddleware } from "store/store";
import AdvancedSettings from "./containers";
import reducer from "./reducer";
import saga from "./saga";

store.injectReducer("vc_advancedConfig", reducer);
sagaMiddleware.run(saga);

export default AdvancedSettings;
