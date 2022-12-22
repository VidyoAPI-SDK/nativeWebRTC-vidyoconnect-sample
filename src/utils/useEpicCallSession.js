import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setEpicCallDocumentTypes,
  setEpicCallSessionInitialized,
  setEpicCallSessionStarted,
} from "store/actions/config";
import { useRequestsInProgress } from "./helpers";
import { portalJWTRequest } from "./portalJWTRequest";

// Moved to hook to be reusable and to avoid duplicating
// Session starts once for the whole application, but can be invoked in different places

// Doesn't return anything because all data saves in store.
// and do not need to invoke methods outside of hook

// useRequestsInProgress helps to avoid sending of multiple same requests

export const handleEpicCallError = (e, message) => {
  const error = e?.response?.data?.error
    ? e.response.data.error?.message || JSON.stringify(e.response.data.error)
    : e?.message;

  console.error(`EPIC Call: ${message}. Reason:`, error);
};

export default function useEpicCallSession() {
  const {
    urlEpicCallLaunchToken,
    listOfGCPServices,
    jwtToken,
    epicCallSessionInitialized,
    epicCallSessionStarted,
  } = useSelector((state) => state.config);
  const epicCallMediaAPIServer = listOfGCPServices?.epicService?.url;
  const dispatch = useDispatch();

  const [isRequestInProgress, addRequestInProgress, deleteRequestInProgress] =
    useRequestsInProgress();

  const startSession = useCallback(async () => {
    const URL = `${epicCallMediaAPIServer}/sessions`;

    if (isRequestInProgress(URL)) {
      console.log(
        `EPIC Call: prevent sending ${URL} request, since it already in-progress.`
      );
      return;
    }

    const data = {
      launchToken: urlEpicCallLaunchToken.value,
    };

    const options = {
      url: URL,
      method: "POST",
      data,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    };

    try {
      if (!urlEpicCallLaunchToken.value) {
        throw new Error("Launch token value is not available");
      }

      addRequestInProgress(URL);
      const res = await portalJWTRequest(options);

      console.log(
        "EPIC Call: session started with status -",
        res?.data?.status
      );

      return res;
    } catch (e) {
      handleEpicCallError(e, "error occur while starting session");
    } finally {
      deleteRequestInProgress(URL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlEpicCallLaunchToken.value, epicCallMediaAPIServer, jwtToken]);

  const waitReadySessionStatus = useCallback(async () => {
    const URL = `${epicCallMediaAPIServer}/sessions/status`;

    if (isRequestInProgress(URL)) {
      console.log(
        `EPIC Call: prevent sending ${URL} request, since it already in-progress.`
      );
      return;
    }

    const options = {
      url: URL,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    };
    try {
      addRequestInProgress(URL);
      const res = await portalJWTRequest(options);

      if (res?.data?.data?.stage === "PROGRESSING") {
        return new Promise((resolve) => {
          setTimeout(resolve, 3000);
        }).then(waitReadySessionStatus);
      }

      return res;
    } catch (e) {
      handleEpicCallError(e, "error occur while fetching session status");
    } finally {
      deleteRequestInProgress(URL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epicCallMediaAPIServer, jwtToken]);

  useEffect(() => {
    if (jwtToken && epicCallMediaAPIServer && !epicCallSessionInitialized) {
      startSession().then((res) => {
        if (res?.status === 200 || res?.status === 202) {
          dispatch(setEpicCallSessionInitialized(true));
        }
      });
    }
  }, [
    jwtToken,
    startSession,
    epicCallMediaAPIServer,
    epicCallSessionInitialized,
    dispatch,
  ]);

  useEffect(() => {
    if (epicCallSessionInitialized && !epicCallSessionStarted) {
      waitReadySessionStatus().then((res) => {
        if (res?.data?.data?.documentMediaTypes) {
          dispatch(setEpicCallSessionStarted(true));
          dispatch(setEpicCallDocumentTypes(res.data.data.documentMediaTypes));
        }
      });
    }
  }, [
    dispatch,
    epicCallSessionInitialized,
    epicCallSessionStarted,
    waitReadySessionStatus,
  ]);
}
