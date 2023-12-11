import store, { sagaMiddleware } from "store/store";
import reducer from "./reducer";
import saga from "./saga";
import Global, {
  ParticipantListMenuItem,
  ControlPanel,
  SelectList,
} from "./containers";

store.injectReducer("feature_stethoscope", reducer);
sagaMiddleware.run(saga);

export { Global, SelectList, ControlPanel, ParticipantListMenuItem };
