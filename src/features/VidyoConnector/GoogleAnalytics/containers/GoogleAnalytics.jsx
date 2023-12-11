import React, { useCallback, useState } from "react";
import Settings from "./Settings";
import { Button, Checkbox, Classes, Intent, Popover } from "@blueprintjs/core";
import * as actionCreators from "../actions/creators";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import "./GoogleAnalytics.scss";

const mapStateToProps = ({ vc_analytics }) => ({
  ...vc_analytics,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(actionCreators, dispatch),
});

const GoogleAnalytics = ({
  isGaEnabled,
  isGaStarted,
  gaTrackingId,
  startAnalytics,
  stopAnalytics,
}) => {
  const [isGaPopUpOpen, showGaPopUp] = useState(false);

  const startOrStopGA = useCallback(() => {
    if (isGaStarted) {
      stopAnalytics();
    } else {
      startAnalytics({
        serviceType: "VIDYO_CONNECTORANALYTICSSERVICETYPE_Google",
        trackingID: gaTrackingId,
      });
    }
  }, [isGaStarted, gaTrackingId, startAnalytics, stopAnalytics]);

  return (
    <fieldset>
      <legend>Google analytics</legend>
      <Checkbox
        checked={isGaStarted}
        className={Classes.INTENT_PRIMARY}
        label={"Google Analytics"}
        disabled={!isGaEnabled}
        onChange={startOrStopGA}
      />
      <Popover
        onClose={() => showGaPopUp(false)}
        popoverClassName={Classes.POPOVER_CONTENT_SIZING}
        isOpen={isGaPopUpOpen}
        fill={true}
      >
        <Button
          onClick={() => showGaPopUp(!isGaPopUpOpen)}
          intent={Intent.PRIMARY}
          disabled={!isGaEnabled}
          text={"Settings"}
          small={true}
          fill={true}
        />
        <Settings />
      </Popover>
    </fieldset>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GoogleAnalytics);
