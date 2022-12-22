import React, { useEffect, useRef, useState, useCallback } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { SvgIcon } from "./../SvgIcon";
import { Position, Tooltip, Popover } from "@blueprintjs/core";
import { useTranslation } from "react-i18next";
import * as googleAnalytics from "store/actions/googleAnalytics";
import { getCallAPIProvider } from "services/CallAPIProvider";
import { useIsTouchScreen } from "utils/hooks";
import "./CallQualityIndicator.scss";

// const mapState = ({ call }) => {
//   return {
//     availibleResources: call.availibleResources,
//   };
// };

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(googleAnalytics, dispatch),
});

const calculateAvailibleBandwith = (totalBandwith, availibleBandwith) => {
  if (availibleBandwith < totalBandwith) return 24; // red
  const bandwithСorrelation = availibleBandwith / totalBandwith;
  if (bandwithСorrelation < 1.1) return 49; // yellow
  return 100; // green
};

const CallQualityIndicator = ({
  // availibleResources,
  averageQualityOfSendingBandwidth,
  averageQualityOfReceivingBandwidth,
}) => {
  const [sendBandwidth, setSendBandwidth] = useState("good");
  const [receivedBandwidth, setReceivedBandwidth] = useState("good");
  const intervalRef = useRef(null);
  const intervalTime = 10000;
  const bandwithRecords = useRef({
    sumByBandwidthSend: 0,
    sumByBandwidthReceive: 0,
    entries: 0,
  });

  const colorIndicator = {
    poor: "red",
    average: "yellow",
    good: "green",
  };
  const { t } = useTranslation();
  const isTouchScreen = useIsTouchScreen();

  const startReceivingBandwithFromStats = useCallback(
    (mRoom) => {
      const getBandwithFromStats = async () => {
        try {
          const vidyoConnector =
            getCallAPIProvider().vidyoConnector ||
            getCallAPIProvider().vidyoEndpoint;
          const stats = await vidyoConnector.GetStatsJson();
          const parsedStats = JSON.parse(stats);
          const roomStats = parsedStats.userStats[0].roomStats.filter(
            (roomData) => {
              // Filter inactive rooms if any
              return roomData?.participantStats.length && roomData.callId;
            }
          )[0];
          if (roomStats) {
            // The same calculation as in Resourse tab in Logs analyzer and in Statistics Analyzer for "Network" row.
            // const bandwidthEncodePct = Math.round(
            //   (Math.min(
            //     roomStats.currentBandwidthEncodePixelRate,
            //     roomStats.maxEncodePixelRate
            //   ) /
            //     roomStats.maxEncodePixelRate) *
            //     100
            // );
            // const bandwidthDecodePct = Math.round(
            //   (Math.min(
            //     roomStats.currentBandwidthDecodePixelRate,
            //     roomStats.maxDecodePixelRate
            //   ) /
            //     roomStats.maxDecodePixelRate) *
            //     100
            // );

            const bandwidthDecodePct = calculateAvailibleBandwith(
              roomStats.receiveBitRateTotal,
              roomStats.receiveBitRateAvailable
            );
            const bandwidthEncodePct = calculateAvailibleBandwith(
              roomStats.sendBitRateTotal,
              roomStats.sendBitRateAvailable
            );
            console.log(
              `receiveBitRateTotal: ${roomStats.receiveBitRateTotal} / receiveBitRateAvailable: ${roomStats.receiveBitRateAvailable} |||| sendBitRateTotal: ${roomStats.sendBitRateTotal} / sendBitRateAvailable: ${roomStats.sendBitRateAvailable}`
            ); // todo remove

            if (!isNaN(bandwidthEncodePct) && !isNaN(bandwidthDecodePct)) {
              setSendBandwidth(
                bandwidthEncodePct >= 50
                  ? "good"
                  : bandwidthEncodePct >= 25
                  ? "average"
                  : "poor"
              );
              setReceivedBandwidth(
                bandwidthDecodePct >= 50
                  ? "good"
                  : bandwidthDecodePct >= 25
                  ? "average"
                  : "poor"
              );
              // Save record for analitics
              // TODO change values back when we will use VC callback
              bandwithRecords.current.sumByBandwidthSend +=
                bandwidthEncodePct >= 50 ? 3 : bandwidthEncodePct >= 25 ? 2 : 1;
              bandwithRecords.current.sumByBandwidthReceive +=
                bandwidthDecodePct >= 50 ? 3 : bandwidthDecodePct >= 25 ? 2 : 1;
              bandwithRecords.current.entries++;
              console.log(
                `Received from statistc bandwidthEncodePct: ${bandwidthEncodePct}, bandwidthDecodePct: ${bandwidthDecodePct}`
              );
            }
          }
        } catch (e) {
          console.error("Error during call startReceivingBandwithFromStats", e);
        }
      };
      intervalRef.current = setInterval(getBandwithFromStats, intervalTime);
      getBandwithFromStats();
    },
    [setSendBandwidth, setReceivedBandwidth]
  );

  const stopReceivingBandwithFromStats = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  // const getBandwidthSend = (bandwidthSend) => {
  //   let videoBandWidthSend = bandwidthSend ? bandwidthSend : "good";
  //   if (videoBandWidthSend < 70) {
  //     return "poor";
  //   } else if (videoBandWidthSend < 90) {
  //     return "average";
  //   } else {
  //     return "good";
  //   }
  // };

  // const getBandwidthReceive = (bandwidthReceive) => {
  //   let videoBandWidthReceive = bandwidthReceive ? bandwidthReceive : "good";
  //   if (videoBandWidthReceive < 70) {
  //     return "poor";
  //   } else if (videoBandWidthReceive < 90) {
  //     return "average";
  //   } else {
  //     return "good";
  //   }
  // };

  // let bandwidthSend = availibleResources
  //   ? getBandwidthSend(availibleResources.bandwidthSend)
  //   : "good";
  // let bandwidthReceive = availibleResources
  //   ? getBandwidthReceive(availibleResources.bandwidthReceive)
  //   : "good";

  // useEffect(() => {
  //   const bandwidthSend = parseInt(availibleResources?.bandwidthSend, 10);
  //   const bandwidthReceive = parseInt(availibleResources?.bandwidthReceive, 10);
  //   if (!isNaN(bandwidthSend) && !isNaN(bandwidthReceive)) {
  //     bandwithRecords.current.sumByBandwidthSend += bandwidthSend;
  //     bandwithRecords.current.sumByBandwidthReceive += bandwidthReceive;
  //     bandwithRecords.current.entries++;
  //   }
  // }, [availibleResources]);

  useEffect(() => {
    startReceivingBandwithFromStats();
    return () => {
      stopReceivingBandwithFromStats();
    };
  }, [startReceivingBandwithFromStats, stopReceivingBandwithFromStats]);

  useEffect(
    () => () => {
      if (!bandwithRecords.current.entries) return;
      const avarageBandwidthSend =
        Math.round(
          bandwithRecords.current.sumByBandwidthSend /
            bandwithRecords.current.entries
        ) || 0;
      const avarageBandwidthReceive =
        Math.round(
          bandwithRecords.current.sumByBandwidthReceive /
            bandwithRecords.current.entries
        ) || 0;
      // TODO change values back to >- 50 and >- 25 when will use VC callback
      const avarageBandwidthSendStr =
        avarageBandwidthSend === 3
          ? "Good"
          : avarageBandwidthSend === 2
          ? "Average"
          : "Poor";
      const avarageBandwidthReceiveStr =
        avarageBandwidthReceive === 3
          ? "Good"
          : avarageBandwidthReceive === 2
          ? "Average"
          : "Poor";
      averageQualityOfSendingBandwidth(avarageBandwidthSendStr); // analitics
      averageQualityOfReceivingBandwidth(avarageBandwidthReceiveStr); // analitics
      console.log(
        `Avarage availible banwith during the call: bandwidthReceive: ${avarageBandwidthReceiveStr}, bandwidthSend: ${avarageBandwidthSendStr}`
      );
    },
    [averageQualityOfSendingBandwidth, averageQualityOfReceivingBandwidth]
  );

  return (
    <Popover
      position={Position.BOTTOM}
      popoverClassName="call-quality-indiactor-popupover"
      wrapperTagName="div"
      content={
        <div id="call-quality-indiactor-lolltip-content">
          <p>{`${t("VIDEO_RECEVING")}: ${t(
            `VIDEO_RECEVING_${receivedBandwidth.toUpperCase()}_TOOLTIP`
          )}`}</p>
          <br />
          <p>{`${t("VIDEO_SENDING")}: ${t(
            `VIDEO_SENDING_${sendBandwidth.toUpperCase()}_TOOLTIP`
          )}`}</p>
        </div>
      }
      disabled={!isTouchScreen}
    >
      <Tooltip
        content={
          <div id="call-quality-indiactor-lolltip-content">
            <p>{`${t("VIDEO_RECEVING")}: ${t(
              `VIDEO_RECEVING_${receivedBandwidth.toUpperCase()}_TOOLTIP`
            )}`}</p>
            <br />
            <p>{`${t("VIDEO_SENDING")}: ${t(
              `VIDEO_SENDING_${sendBandwidth.toUpperCase()}_TOOLTIP`
            )}`}</p>
          </div>
        }
        position={Position.BOTTOM}
        transitionDuration={500}
        wrapperTagName="div"
        popoverClassName="call-quality-indiactor-tooltip"
      >
        <div id="call-quality-indicator">
          <SvgIcon
            name="arrow-down"
            customClass={"font-" + colorIndicator[receivedBandwidth]}
          />
          <SvgIcon
            name="arrow-up"
            customClass={"font-" + colorIndicator[sendBandwidth]}
          />
        </div>
      </Tooltip>
    </Popover>
  );
};

export default connect(null, mapDispatchToProps)(CallQualityIndicator);
