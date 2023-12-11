import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getCallAPIProvider } from "services/CallAPIProvider";
import { useSelector } from "react-redux";

const getVidyoConnector = () =>
  getCallAPIProvider().vidyoConnector || getCallAPIProvider().vidyoEndpoint;

const startSendingStats = (pushURL) => {
  getVidyoConnector().SetOptions({
    pushStats: {
      enabled: true,
      pushURL,
      // pushInterval: 10000,    // optional (ms)
      // trackingID: "test-id",  // optional
    },
  });
  console.log(`Start sending statistics to: ${pushURL}`);
};

const stopSendingStats = () => {
  try {
    getVidyoConnector().SetOptions({
      pushStats: {
        enabled: false,
      },
    });
    console.log(`Stop sending statistics`);
  } catch (err) {
    console.log("Error occured while SetOptions", err);
  }
};

const getConferenceIdPromise = () => {
  const vidyoConnector = getVidyoConnector();

  if (vidyoConnector) {
    return vidyoConnector?.GetStatsJson().then((statsJson) => {
      return JSON.parse(statsJson).userStats[0]?.roomStats[0]?.conferenceId;
    });
  }

  return Promise.resolve();
};

const useLoki = (isCallActive, insightServerUrl) => {
  const location = useLocation();
  const participantList = useSelector((state) => state.call.participants.list);
  const callStartedTime = useSelector((state) => state.call.callStartedTime);
  const isAnalyzerURLLoggedForCallTimestamp = useRef(0);

  useEffect(() => {
    if (isCallActive && insightServerUrl) {
      startSendingStats(insightServerUrl);
    }
  }, [location, isCallActive, insightServerUrl]);

  useEffect(() => {
    if (
      isCallActive &&
      insightServerUrl &&
      isAnalyzerURLLoggedForCallTimestamp.current < callStartedTime
    ) {
      const localParticipant = participantList?.find((p) => p.isLocal);
      if (localParticipant) {
        const startTime = Date.now() - 10000;
        const endTime = startTime + 7200000;
        let analyzerURL = `${
          window.appConfig.REACT_APP_STATS_ANALYZER_URL
        }?lokiServer=${insightServerUrl.replace(
          "/push",
          ""
        )}&isLive=false&startTime=${startTime}&endTime=${endTime}`;
        getConferenceIdPromise().then((conferenceId) => {
          if (conferenceId) {
            analyzerURL += `&participantId=${localParticipant.id}&conferenceId=${conferenceId}`;
          } else {
            analyzerURL += `&participantId=${localParticipant.id}`;
          }
          console.log(`Statistics Analyzer URL: ${analyzerURL}`);
          isAnalyzerURLLoggedForCallTimestamp.current = callStartedTime;
        });
      }
    }
  }, [
    location,
    isCallActive,
    insightServerUrl,
    participantList,
    callStartedTime,
  ]);

  useEffect(() => {
    return () => {
      if (insightServerUrl) {
        stopSendingStats();
        isAnalyzerURLLoggedForCallTimestamp.current = 0;
      }
    };
  }, [insightServerUrl]);

  return stopSendingStats;
};

export default useLoki;
