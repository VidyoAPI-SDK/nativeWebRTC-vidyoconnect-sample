import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { isMobileSafari, isAndroid, isMobile, isSafari } from "react-device-detect";
import OperatingSystemInfoProvider from "utils/deviceDetect";
import { useMobileDimension } from "utils/hooks";
import { debounce } from "throttle-debounce";
import { useTranslation } from "react-i18next";
import { deviceDisableReason } from "utils/constants";
import logger from "utils/logger";
import Spinner from "components/Spinner";
import Video from "components/Video";
import { test } from "utils/helpers";
import useBackgroundEffect from "utils/useBackgroundEffect";
import "./SelfView.scss";

const prefix = "SELFVIEW:";
const isMobileOrTablet = isMobile || OperatingSystemInfoProvider.IsTabletDevice();
// same constrains tha VC use when it gets user media
const DEFAULT_VIDEO_CONSTARINS = {
  height: isMobileOrTablet ? 360 : 720,
  width: isMobileOrTablet ? 640 : 1280,
  frameRate: 30
}
let originalStream = null;

const mapStateToProps = ({ devices, config }) => ({
  selectedCamera: devices.selectedCamera,
  isCameraTurnedOn: devices.isCameraTurnedOn,
  isCameraDisabled: devices.isCameraDisabled,
  cameraDisableReasons: devices.cameraDisableReasons,
  cameraMuteControlToggle: config.urlCameraMuteControl.value,
});

const SelfView = ({
  ignoreMuteState,
  externalControls,
  selectedCamera,
  isCameraTurnedOn,
  isCameraDisabled,
  cameraDisableReasons,
  cameraMuteControlToggle,
}) => {
  const { t } = useTranslation();
  const [isMobileDimension] = useMobileDimension();
  const [isPlaying, setPlaying] = useState(false);
  const [facingMode, setFacingMode] = useState("");
  const [stream, setStream] = useState(null);
  const isMounted = useRef(false);
  const [backgroundEffectAvailable] = useBackgroundEffect();

  const isCameraOff = !ignoreMuteState && !isCameraTurnedOn;
  const isNotPermitted = cameraDisableReasons.includes(
    deviceDisableReason.NO_PERMISSION
  );

  const startSource = debounce(500, (retry) => {
    stopSource();
    if (selectedCamera) {
      const deviceId = selectedCamera.id;
      logger.info(
        `${prefix} asking stream ${retry ? "on retry" : ""
        } for device ${deviceId}`
      );
      if (window.banuba?.getLastStream) {
        const stream = window.banuba.getLastStream();
        if (stream?.active) {
          stream.fromCache = true;
          setStream(stream);
          stream.getVideoTracks().forEach((track) => {
            setFacingMode(track.getSettings().facingMode || "desktop");
          });
          logger.info(
            `${prefix} Stream ${stream.id} was taken from the Banuba plugin cache `
          );
          return;
        }
      }
      navigator.mediaDevices
        .getUserMedia({ video: { deviceId, ...DEFAULT_VIDEO_CONSTARINS } })
        .then((stream) => {
          if (isMounted.current) {
            logger.info(
              `${prefix} Stream ${stream.id} started for device ${deviceId}`
            );
            stream.oninactive = () => {
              logger.info(
                `${prefix} oninactive for stream ${stream.id} inactive for device ${deviceId}`
              );
            };
            stream.getVideoTracks().forEach((track) => {
              setFacingMode(track.getSettings().facingMode || "desktop");
            });
            if (window.banuba?.effectBackground && !stream.fromCache) {
              window.banuba.effectBackground(stream, true).then((effectStream) => {
                originalStream = stream;
                if (isSafari) {
                  setTimeout(() => {
                    // workaround, sometimes on Safari it take more time to get working stream from canvas and we need some delay berore tye to assign it to the video element
                    setStream(effectStream);
                  }, 300)
                } else {
                  setStream(effectStream);
                }
              });
            } else {
              setStream(stream);
            }
          } else {
            logger.info(
              `${prefix} Stream ${stream.id} stopped for device ${deviceId} as component is not mounted`
            );
            setTimeout(() => {
              stream.getVideoTracks().forEach((track) => track.stop());
              if (originalStream) {
                stream.getVideoTracks().forEach((track) => track.stop());
                originalStream = null;
              }
            });
          }
        })
        .catch((e) => {
          logger.error(
            `${prefix} Stream ${stream.id
            } for device ${deviceId} is not started. ${e.toString()}`
          );
          setStream(null);
          if (!retry && e.name === "NotReadableError") {
            startSource(true);
          }
        });
    } else {
      logger.info(`${prefix} Camera is not selected`);
    }
  });

  const stopSource = () => {
    if (stream) {
      logger.info(`${prefix} Stream ${stream.id} stopped`);
      setStream(null);
      setPlaying(false);
      const stopTracks = () => {
        stream.getVideoTracks().forEach((track) => track.stop());
        if (originalStream) {
          stream.getVideoTracks().forEach((track) => track.stop());
          originalStream = null;
        }
      }
      if (ignoreMuteState) {
        stopTracks();
        return;
      }
      setTimeout(stopTracks);
      
    }
  };

  const onPlaying = () => {
    logger.info(`${prefix} onPlaying for stream ${stream.id}`);
    setPlaying(true);
  };

  const onPause = () => {
    logger.info(`${prefix} onPause for stream ${(stream || {}).id}`);
    setPlaying(false);
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isCameraDisabled && isCameraTurnedOn) {
      if (selectedCamera && selectedCamera.isStarted) {
        startSource();
      } else {
        stopSource();
      }
    } else if (!isCameraDisabled && ignoreMuteState) {
      startSource();
    } else {
      stopSource();
    }
    return () => {
      startSource.cancel();
      if (stream) {
        logger.info(
          `${prefix} Stream ${stream.id} stopped as component unmounted`
        );
        setTimeout(() => {
          stream.getVideoTracks().forEach((track) => track.stop());
          if (originalStream) {
            stream.getVideoTracks().forEach((track) => track.stop());
            originalStream = null;
          }
        });
      }
    };
    // eslint-disable-next-line
  }, [
    ignoreMuteState,
    isCameraDisabled,
    isCameraTurnedOn,
    selectedCamera,
    backgroundEffectAvailable,
  ]);

  const Loading = () => {
    if (!isCameraOff && !isPlaying) {
      return <Spinner width={24} height={24} />;
    }
    return null;
  };

  const ExternalControls = () => {
    if (!cameraMuteControlToggle) {
      return null;
    }

    if (
      (isMobileSafari || isAndroid || isMobileDimension) &&
      externalControls
    ) {
      return (
        <div className="external-controls-container">{externalControls}</div>
      );
    }
    return null;
  };

  if (isCameraOff || isNotPermitted) {
    return (
      <div className="self-view">
        <div className="placeholder" {...test("SELF_VIEW_OFF")}>
          {t("CAMERA_OFF")}
        </div>
      </div>
    );
  }

  return (
    <div className="self-view">
      <div className="self-view-render">
        <Loading />
        <Video
          stream={stream}
          data-playing={isPlaying}
          className={`video-tile ${facingMode}`}
          onPlaying={onPlaying}
          onPause={onPause}
          {...test("SELF_VIEW")}
        />
        <ExternalControls />
      </div>
    </div>
  );
};

export default connect(mapStateToProps)(SelfView);
