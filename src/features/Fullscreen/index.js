import store, { sagaMiddleware } from "store/store";
import Toggle, { LABEL } from "./containers/Toggle";
import i18n from "translations/i18n";
import reducer from "./reducer";
import saga from "./saga";

const i18ns = "translation";

i18n.addResource("de", i18ns, LABEL, "Vollbildmodus aktivieren");
i18n.addResource("en", i18ns, LABEL, "Enable fullscreen mode");
i18n.addResource("es", i18ns, LABEL, "Habilitar el modo de pantalla completa");
i18n.addResource("fr", i18ns, LABEL, "Activer le mode plein écran");
i18n.addResource("it", i18ns, LABEL, "Abilita la modalità a schermo intero");
i18n.addResource("ja", i18ns, LABEL, "フルスクリーンモードを有効にする");
i18n.addResource("ko", i18ns, LABEL, "전체 화면 모드 사용");
i18n.addResource("pl", i18ns, LABEL, "Włącz tryb pełnoekranowy");
i18n.addResource("uk", i18ns, LABEL, "Увімкнути повноекранний режим");
i18n.addResource("zh", i18ns, LABEL, "启用全屏模式");

store.injectReducer("feature_fullscreen", reducer);
sagaMiddleware.run(saga);

export { Toggle };
