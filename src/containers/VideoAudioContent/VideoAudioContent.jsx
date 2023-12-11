import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/lazy";
import "./VideoAudioContent.scss";
import ControlsBlock from "./Controls/ControlsBlock";
import SpinnerDots from "./Spinner-dots/Spinner-dots";

let playOnErrorRetryCounter = 0;
let tryToChangeFormat = true;

const VideoAudioContent = ({
  selectedSpeaker,
  videoURL,
  audioURL,
  backgroundURL,
  onErrorCallback = () => {},
  disableAudio,
  sendAnalytics = () => {},
}) => {
  const [isPlaying, setPlayingState] = useState(true);
  const [isMuted, setMuteState] = useState(disableAudio);
  const [internalPlayer, setInternalPlayer] = useState(null);
  const [isLoading, setLoadState] = useState(
    disableAudio && !videoURL ? false : !!videoURL || !!audioURL
  );
  const [isPlayerShow, showPlayer] = useState(true);
  const [contentUrl, setContentUrl] = useState(videoURL || audioURL);
  const [showControl, setShowControl] = useState(true);
  const playerRef = useRef(null);
  const hideControlTimer = 5000;
  const isAnalitycsSent = useRef(false);
  let controlTimer = useRef(-1);

  const attachPlayerAudioToSpeaker = useCallback((speaker = {}, player) => {
    if (player && player.setSinkId && speaker.id) {
      player.setSinkId(speaker.id);
    }
  }, []);

  const playerOnReadyHandler = () => {
    const player = playerRef.current.getInternalPlayer();
    setInternalPlayer(player);
    attachPlayerAudioToSpeaker(selectedSpeaker, player);
    setLoadState(false);

    // Send event to the google analytics
    if (!isAnalitycsSent.current) {
      const eventType = videoURL
        ? "video"
        : backgroundURL
        ? "audioAndBGImage"
        : "audio";
      sendAnalytics(eventType);
      isAnalitycsSent.current = true;
    }
  };

  const tryToChangeMediaFormatInURL = () => {
    tryToChangeFormat = false;
    setLoadState(true);
    showPlayer(false);
    if (contentUrl.endsWith(".mp4")) {
      setContentUrl(contentUrl.replace(/\.mp4$/, ".webm"));
    } else if (contentUrl.endsWith(".webm")) {
      setContentUrl(contentUrl.replace(/\.webm$/, ".mp4"));
    } else if (contentUrl.endsWith(".mp3")) {
      setContentUrl(contentUrl.replace(/\.mp3$/, ".ogg"));
    } else if (contentUrl.endsWith(".ogg")) {
      setContentUrl(contentUrl.replace(/\.ogg$/, ".mp3"));
    }
    setTimeout(() => showPlayer(true), 100);
  };

  const playerOnErrorHandler = (eventResponse) => {
    // Sometimes onError returns error obj and sometimes event obj
    console.error("Error occurred on play waiting room content", eventResponse);

    if (
      !eventResponse.message &&
      eventResponse.target &&
      eventResponse.target.error &&
      eventResponse.target.error.message ===
        "AUDIO_RENDERER_ERROR: audio render error" &&
      playOnErrorRetryCounter < 1
    ) {
      // This block handles case when on windows user unplug active speaker and player stops working. We reload player.
      playOnErrorRetryCounter++;
      setLoadState(true);
      showPlayer(false);
      setTimeout(() => showPlayer(true), 100);
      return;
    }

    if (!eventResponse.message && tryToChangeFormat) {
      // If source is not supported try to change format video: .mp4 <--> .webm, audio: .mp3 <--> .ogg
      tryToChangeMediaFormatInURL();
      return;
    }

    setPlayingState(false);
    if (eventResponse.message && eventResponse.message.includes) {
      if (
        eventResponse.message.includes("not allowed") ||
        eventResponse.message.includes(
          "play() failed because the user didn't interact with the document first"
        )
      ) {
        if (videoURL && !isMuted) {
          setMuteState(true);
          console.error("mute and play again");
          setTimeout(() => setPlayingState(true), 100);
        } else {
          setLoadState(false);
        }
      } else if (
        eventResponse.message.includes(
          "The play() request was interrupted by a call to pause()."
        )
      ) {
        // ignore this case. It can happens when user click pause during video loading
      } else if (tryToChangeFormat) {
        // If source is not supported try to change format video: .mp4 <--> .webm, audio: .mp3 <--> .ogg
        tryToChangeMediaFormatInURL();
      }
    } else {
      setLoadState(false);
      onErrorCallback();
    }
  };

  useEffect(() => {
    attachPlayerAudioToSpeaker(selectedSpeaker, internalPlayer);
  }, [selectedSpeaker, attachPlayerAudioToSpeaker, internalPlayer]);

  useEffect(() => {
    return () => {
      if (internalPlayer) {
        if (internalPlayer.pause) {
          internalPlayer.pause();
        } else if (internalPlayer.pauseVideo) {
          internalPlayer.pauseVideo();
        }
      }
    };
  }, [internalPlayer]);

  const showControlBar = () => {
    setShowControl(true);
    window.clearTimeout(controlTimer.current);
    controlTimer.current = window.setTimeout(() => {
      setShowControl(false);
    }, hideControlTimer);
  };

  useEffect(() => {
    setShowControl(true);
    controlTimer.current = window.setTimeout(() => {
      setShowControl(false);
    }, hideControlTimer);
    return () => {
      playOnErrorRetryCounter = 0;
      tryToChangeFormat = true;
      window.clearTimeout(controlTimer.current);
    };
  }, []);

  if (!videoURL && !audioURL && !backgroundURL) {
    return null;
  }

  if (!videoURL && audioURL && disableAudio && !backgroundURL) {
    onErrorCallback();
    return null;
  }

  if (contentUrl && !backgroundURL && !ReactPlayer.canPlay(contentUrl)) {
    // static method canPlay checks in general if format can be played but doesn't check for specific browser or permissions, ect.
    console.error("Player cannot play media from provided url", contentUrl);
    setTimeout(() => onErrorCallback(), 100);
    return null;
  }

  if (!isAnalitycsSent.current) {
    if (backgroundURL && !videoURL && (!audioURL || disableAudio)) {
      // Send event to the google analytics
      sendAnalytics("backgroundImage");
      isAnalitycsSent.current = true;
    }
  }

  return (
    <div
      className={`video-audio-content${isLoading ? " loading" : ""}`}
      style={
        backgroundURL && !videoURL
          ? {
              backgroundImage: `url(${backgroundURL})`,
              backgroundSize: "contain",
            }
          : {}
      }
      onMouseMove={showControlBar}
      onClick={showControlBar}
    >
      {isLoading && <SpinnerDots />}
      {isPlayerShow && (videoURL || (audioURL && !disableAudio)) && (
        <>
          <ReactPlayer
            ref={playerRef}
            className="react-player"
            url={contentUrl}
            width="100%"
            height="100%"
            playing={isPlaying}
            volume={1}
            muted={isMuted} // Only works if volume is set
            loop
            playsinline
            onReady={playerOnReadyHandler}
            onError={playerOnErrorHandler}
            onPause={() => setPlayingState(false)}
            onEnded={() => setPlayingState(false)}
            onPlay={() => {
              playOnErrorRetryCounter = 0;
            }}
          />
          {
            <ControlsBlock
              additionalClass={showControl ? "fadeIn" : "fadeOut"}
              isPlaying={isPlaying}
              isMuted={isMuted}
              setPlayingState={setPlayingState}
              setMuteState={setMuteState}
              disableAudio={disableAudio}
            />
          }
        </>
      )}
    </div>
  );
};

export default VideoAudioContent;
