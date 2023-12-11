import React, { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  getCcInitialized,
  getParticipantsList,
  getPinnedParticipant,
} from "store/selectors/call";
import {
  getRemoteCameras,
  getSelectedCamera,
  getSelectedSpeaker,
} from "store/selectors/devices";
import { qaEpicWaitingRoomMediaContent } from "store/actions/googleAnalytics";
import CallStatusMessage from "components/CallStatusMessage/CallStatusMessage";
import CallModeration from "containers/CallModeration/CallModeration";
import VideoAudioContent from "containers/VideoAudioContent/VideoAudioContent";
import { Stethoscope } from "features";
import { useTabletDimension, useVisibility, useWindowBlur } from "utils/hooks";
import { isMobile, isMobileSafari } from "react-device-detect";
import {
  assignVideoRenderer,
  pinParticipantSuccess,
  resetPinParticipant,
} from "store/actions/call";
import { useLocation } from "react-router-dom";
import { cameraTurnOff, cameraTurnOn } from "store/actions/devices";

const Renderer = ({
  isMobileDimension,
  dataForAudioVideoContent,
  isCameraTurnedOn,
  setDataForAudioVideoContent,
  moderationPanelOpened,
  userIsRegistered,
}) => {
  const { t } = useTranslation();
  const ccInitialized = useSelector(getCcInitialized);
  const selectedSpeaker = useSelector(getSelectedSpeaker);
  const selectedCamera = useSelector(getSelectedCamera);
  const pinnedParticipant = useSelector(getPinnedParticipant);
  const remoteCameras = useSelector(getRemoteCameras);
  const participantsList = useSelector(getParticipantsList);
  const dispatch = useDispatch();
  const [isTablet] = useTabletDimension();
  const location = useLocation();
  const [isBackground] = useVisibility();
  const isBlurred = useWindowBlur();

  const renderer = "renderer";

  const renderAudioVideoContent = () => {
    if (dataForAudioVideoContent) {
      const { videoURL, audioURL, backgroundURL } = dataForAudioVideoContent;
      return (
        <VideoAudioContent
          selectedSpeaker={selectedSpeaker}
          videoURL={videoURL}
          audioURL={audioURL}
          backgroundURL={backgroundURL}
          onErrorCallback={() => setDataForAudioVideoContent(null)}
          sendAnalytics={qaEpicWaitingRoomMediaContent}
        />
      );
    }
    return null;
  };

  useEffect(() => {
    dispatch(
      assignVideoRenderer({
        viewId: renderer,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (selectedCamera && selectedCamera.SetPreviewTag) {
      selectedCamera.SetPreviewTag({ previewTag: t("YOU") });
    }
  }, [selectedCamera, t]);

  useEffect(() => {
    if (location.state?.isCameraTurnedOn) {
      dispatch(cameraTurnOn({ selectedCamera }));
    } else {
      dispatch(cameraTurnOff({ selectedCamera }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraTurnOff, cameraTurnOn, location]);

  useEffect(() => {
    const isAway = isBackground || (isMobileSafari && isBlurred);

    if (isCameraTurnedOn && isMobile && isAway) {
      dispatch(cameraTurnOff());
    }
  }, [isCameraTurnedOn, isBackground, isBlurred, dispatch]);

  useEffect(() => {
    /**
     * Handle click on Tile pin button
     */
    const tilePinButtonHandler = (event) => {
      const pinBtn = event?.target?.closest?.(".pin-participant");
      const feccBtn = event?.target?.closest?.(".control-participant");

      if (pinBtn || feccBtn) {
        const tile = event.target.closest(".video-container");
        const participantID = tile?.dataset?.participantId;

        if (!tile || !participantID) return;

        if (tile.classList.contains("pinned-video")) {
          if (pinBtn) {
            dispatch(resetPinParticipant());
          }
        } else {
          const participant = participantsList.find(
            (p) => p.id === participantID
          );
          dispatch(pinParticipantSuccess(participant));
        }
      }
    };

    document.addEventListener("click", tilePinButtonHandler, true);

    return () => {
      document.removeEventListener("click", tilePinButtonHandler, true);
    };
  }, [dispatch, participantsList]);

  /**
   * Resetting participant pin(local state) when he was pinned and his camera has been turned off
   */
  useEffect(() => {
    if (pinnedParticipant) {
      if (
        !remoteCameras.some((c) => c?.participant?.id === pinnedParticipant?.id)
      ) {
        dispatch(resetPinParticipant());
      }
    }
  }, [remoteCameras, pinnedParticipant, dispatch]);

  return (
    <div
      className={`render-container${
        ((isMobile || isMobileDimension) && dataForAudioVideoContent
          ? " video-audio-content-on"
          : "") + (ccInitialized ? " caption-space" : "")
      }`}
    >
      {participantsList.length === 1 && (
        <>
          {!isCameraTurnedOn && (
            <CallStatusMessage
              title={t("YOU_ONLY_ONE_PERSON_IN_CALL")}
              description={t("AS_OTHERS_JOIN_CALL_YOU_WILL_SEE_THEM")}
            />
          )}
          {renderAudioVideoContent()}
        </>
      )}
      {moderationPanelOpened && userIsRegistered && !isTablet && (
        <CallModeration />
      )}
      <div id="renderer"></div>
      <Stethoscope.ControlPanel />
    </div>
  );
};

export default memo(Renderer);
