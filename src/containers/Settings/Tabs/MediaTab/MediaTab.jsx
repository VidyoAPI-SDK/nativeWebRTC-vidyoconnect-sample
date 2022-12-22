import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import MicrophoneSelectList from "./selects/MicrophoneSelectList";
import SpeakerSelectList from "./selects/SpeakerSelectList";
import CameraSelectList from "./selects/CameraSelectList";
import SelfView from "containers/SelfView";
import "./MediaTab.scss";
import { Stethoscope } from "features";
import CameraEffectsSelector from "containers/CameraEffectsSelector";
import { useSelector } from 'react-redux';

const MediaTab = () => {
  const { t } = useTranslation();
  const [showSelfView, setShowSelfView] = useState(true);
  const { urlInitializeWebView } = useSelector(state => state.config);

  const onShowSelfView = useCallback((value) => {
    setShowSelfView(value);
  }, [setShowSelfView]);

  return (
    <div className="settings-tab-content media-tab-content">
      <div className="settings-tab-content-header">
        {t("SETTINGS_AUDIO_VIDEO")}
      </div>
      <div className="settings-tab-content-body">
        <div className="tab-content-body-panel left-pane">
          <MicrophoneSelectList />
          <SpeakerSelectList />
          <Stethoscope.SelectList />
        </div>
        <div className="tab-content-body-panel right-pane">
          {
            !urlInitializeWebView.value &&
              <>
                {<CameraSelectList />}
                {showSelfView && <SelfView ignoreMuteState={true} />}
                {<CameraEffectsSelector showSelfView={onShowSelfView} />}
              </>
          }
        </div>
      </div>
    </div>
  );
};

export default MediaTab;
