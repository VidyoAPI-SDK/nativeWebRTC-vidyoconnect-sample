import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useVideoAudioContent() {
  const {
    customParameters,
    urlWaitingRoomVideoContent,
    urlWaitingRoomAudioContent,
    urlWaitingRoomBackgroundContent,
    extData,
    extDataType,
  } = useSelector((state) => state.config);
  const { userIsRegistered } = useSelector((state) => state.user);
  const { participants } = useSelector((state) => state.call);
  const [dataForAudioVideoContent, setDataForAudioVideoContent] =
    useState(null);

  useEffect(() => {
    if (
      urlWaitingRoomVideoContent.value ||
      urlWaitingRoomAudioContent.value ||
      urlWaitingRoomBackgroundContent.value
    ) {
      const userCustomParams = customParameters;
      // Only for Epic users with extData and extDataType === 1, according to Phase 1
      if (userCustomParams && extData && extDataType === "1") {
        const data = {};
        if (urlWaitingRoomVideoContent.value)
          data.videoURL =
            userCustomParams[`wrvc${urlWaitingRoomVideoContent.value}`];
        if (urlWaitingRoomAudioContent.value)
          data.audioURL =
            userCustomParams[`wrac${urlWaitingRoomAudioContent.value}`];
        if (urlWaitingRoomBackgroundContent.value)
          data.backgroundURL =
            userCustomParams[`wrbc${urlWaitingRoomBackgroundContent.value}`];

        const mappedInvocationParams = {
          videoURL: "wrvc",
          audioURL: "wrac",
          backgroundURL: "wrbc",
        };

        const matchedData = Object.keys(data).filter((item) => {
          if (data[item]) return true;
          console.error(
            `Not matched data in custom parameters for ${mappedInvocationParams[item]} parameter (${item})`
          );
          return false;
        });

        if (matchedData.length) {
          setDataForAudioVideoContent(data);
        }
      }
    }
  }, [
    customParameters,
    setDataForAudioVideoContent,
    urlWaitingRoomVideoContent,
    urlWaitingRoomAudioContent,
    urlWaitingRoomBackgroundContent,
    extData,
    extDataType,
    userIsRegistered,
  ]);

  useEffect(() => {
    // Clear DataForAudioVideoContent when another participant joined to avoid playing audio/video content at the end of the call
    // and show share and chat.
    if (participants.list.length > 1 && dataForAudioVideoContent) {
      setDataForAudioVideoContent(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.list, setDataForAudioVideoContent]);

  return [dataForAudioVideoContent, setDataForAudioVideoContent];
}
