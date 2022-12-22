import React, { useCallback, useEffect, useState } from "react";
import { getCallAPIProvider } from "services/CallAPIProvider";
import { useInsightServerUrl } from "utils/hooks";
import { useSelector } from "react-redux";

const StatsAnalyzerLink = React.memo(() => {
  const [analyserURL, setAnalyserURL] = useState(
    window.appConfig.REACT_APP_STATS_ANALYZER_URL
  );
  const participantList = useSelector((state) => state.call.participants.list);
  const insightServerUrl = useInsightServerUrl();

  const getConferenceIdPromise = useCallback(() => {
    const callApiProvider = getCallAPIProvider();
    const vidyoConnector =
      callApiProvider.vidyoConnector || callApiProvider.vidyoEndpoint;

    if (vidyoConnector) {
      return vidyoConnector?.GetStatsJson().then((statsJson) => {
        return JSON.parse(statsJson).userStats[0]?.roomStats[0]?.conferenceId;
      });
    }

    return Promise.resolve();
  }, []);

  useEffect(() => {
    let statsURL =
      window.appConfig.REACT_APP_STATS_ANALYZER_URL + "?isLive=true";
    const localParticipant = participantList?.find((p) => p.isLocal);

    if (insightServerUrl) {
      statsURL +=
        "&lokiServer=" +
        encodeURIComponent(insightServerUrl.replace(/\/push$|\/push\/$/, ""));
    }

    if (localParticipant?.id) {
      getConferenceIdPromise().then((conferenceId) => {
        if (conferenceId) {
          statsURL +=
            "&participantId=" +
            localParticipant.id +
            "&conferenceId=" +
            conferenceId;
          setAnalyserURL(statsURL);
        }
      });
    } else {
      setAnalyserURL(statsURL);
    }
  }, [insightServerUrl, participantList, getConferenceIdPromise]);

  if (!analyserURL) {
    return null;
  }

  return (
    <a href={analyserURL} target="_blank" rel="noopener noreferrer">
      View Loki stats here
    </a>
  );
});

export default StatsAnalyzerLink;
