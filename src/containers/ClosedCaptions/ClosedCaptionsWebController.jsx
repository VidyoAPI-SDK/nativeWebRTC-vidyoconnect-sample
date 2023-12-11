import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import ClosedCaptionsView from "./ClosedCaptionsView";
import showNotification from "components/Notifications/Notifications";
import { Logger } from "utils/logger";
import { ccProvider } from "./providers/ClosedCaptionsProvider";
import { test } from "utils/helpers";
import {
  setCcBtnIsActive,
  setCcInialized,
  setCcRequestInProgress,
  setCcSendAnalytics,
} from "store/actions/call";
import { isSafari } from "react-device-detect";

const ccLogger = new Logger("CC");

let msgSubcriber = () => {};

const msgCallback = (msg) => {
  msgSubcriber(msg);
};

const subscribeOnMesaages = (callback) => {
  msgSubcriber = callback;
};

const unsubscribeFromMessages = () => {
  msgSubcriber = () => {};
};

const ClosedCaptionsWebController = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const subscriptionToken = useRef(null);
  const config = useSelector((state) => state.config);
  const call = useSelector((state) => state.call);
  const { listOfGCPServices } = useSelector((state) => state.config);
  const subscriptionUrl = listOfGCPServices.closedCaption.url;

  useEffect(() => {
    dispatch(setCcRequestInProgress(true));

    const stopCC = async () => {
      try {
        if (!subscriptionToken.current) {
          ccLogger.logInfo(
            "Feature wan't started, don't need to send STOP request"
          );
          return;
        }
        ccLogger.logInfo("Request to stop");
        dispatch(setCcRequestInProgress(true));
        dispatch(setCcInialized(false));
        const stopRes = await ccProvider.stopCaptions(subscriptionUrl);

        if (stopRes) {
          ccLogger.logInfo("Request to stop successfull");
        } else {
          ccLogger.logError("Request to stop failed");
        }

        ccLogger.logInfo("Unsubscribe from topic");

        try {
          await ccProvider.unsubscribeFromTopic(
              subscriptionToken.current
          );
        } catch(_) {
          // this promise is rejected only in case client not in call
          // at that moment there are not any active subscriptions
          // so, we can just ignore
        }

        subscriptionToken.current = null;
        ccLogger.logInfo(
          "Unsubscribe from topic successfull. Feature stopped."
        );
        dispatch(setCcRequestInProgress(false));
      } catch (error) {
        dispatch(setCcRequestInProgress(false));
        ccLogger.logError(error);
      }
    };

    (async () => {
      try {
        ccLogger.logInfo("Start closed captioning");
        subscriptionToken.current = await ccProvider.startCaptions(
          subscriptionUrl
        );

        if (!subscriptionToken.current) {
          throw new Error("failed to get subscriptionToken");
        }

        ccLogger.logInfo("Subscribe on topic");
        await ccProvider.subscribeOnTopic(
          subscriptionToken.current,
          msgCallback,
          (status, message, code) => {
            ccLogger.logInfo(
              `Subscription to topic. Status = ${status}, message = ${message}, code = ${code}`
            );
            switch (status) {
              case "SUBSCRIPTION_SUBSCRIBED":
                ccLogger.logInfo(
                  "Subscribe on topic successfull. Feature initialized."
                );
                dispatch(setCcInialized(true));
                dispatch(setCcSendAnalytics(true));
                dispatch(setCcRequestInProgress(false));
                break;
              case "SUBSCRIPTION_ERROR":
                setError(true);
                dispatch(setCcRequestInProgress(false));
                break;
              case "SUBSCRIPTION_INOPERATIVE":
                dispatch(setCcRequestInProgress(false));
                dispatch(setCcBtnIsActive(false));
                break;
              case "SUBSCRIPTION_SUBSCRIBING":
              case "SUBSCRIPTION_UNSUBSCRIBED":
              case "SUBSCRIPTION_Resubscribing":
                break;
              default:
                break;
            }
          }
        );
      } catch (error) {
        ccLogger.logError(error);
        setError(true);
        dispatch(setCcRequestInProgress(false));
      }
    })();

    return () => {
      stopCC();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      showNotification("bannerWithBtns", {
        type: "banner",
        showFor: 10000,
        message: t("ERROR_CC"),
        buttons: [
          {
            autoClickAfterNSeconds: 10,
            text: t("HIDE"),
          },
        ],
      });
      setError(false);
      dispatch(setCcBtnIsActive(false));
    }
  }, [dispatch, error, t]);

  return (
    call.cc.initialized && (
      <ClosedCaptionsView
        subscribeOnMesaages={subscribeOnMesaages}
        unsubscribeFromMessages={unsubscribeFromMessages}
        uiOptions={{
          fontSize: config.captionFontSize,
          backColor: config.captionBackground,
          test,
          isSafari,
        }}
      />
    )
  );
};

export default ClosedCaptionsWebController;
