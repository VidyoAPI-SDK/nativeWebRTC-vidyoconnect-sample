import store, { sagaMiddleware } from "store/store";
import GoogleAnalyticsSettings from "./containers";
import reducer from "./reducer";
import saga from "./saga";

store.injectReducer("vc_analytics", reducer);
sagaMiddleware.run(saga);

export { GoogleAnalyticsSettings as Settings };
