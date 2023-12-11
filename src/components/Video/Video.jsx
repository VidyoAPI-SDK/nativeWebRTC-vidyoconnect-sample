import React, { useRef, useEffect } from "react";

const Video = ({ stream, ...props }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const currentVideo = videoRef.current;
    if (stream) {
      currentVideo.srcObject = stream;
      if (props.autoPlay !== false) {
        currentVideo.play().catch(() => {});
      }
    } else {
      currentVideo.pause();
    }
    return () => {
      if (currentVideo) {
        currentVideo.srcObject = null;
      }
      if (stream) {
        stream.getVideoTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [stream, props.autoPlay]);

  useEffect(() => {
    const { current: videoElement } = videoRef;
    videoElement.setAttribute("muted", "");
  }, []);

  return <video playsInline muted autoPlay ref={videoRef} {...props} />;
};

export default React.memo(Video);
