import React, { useCallback, useState } from "react";
import {
  Button,
  Checkbox,
  Classes,
  Intent,
  InputGroup,
} from "@blueprintjs/core";
import { connect } from "react-redux";
import * as actionCreators from "../../actions/creators";
import { bindActionCreators } from "redux";

const mapStateToProps = ({ vc_analytics }) => ({
  ...vc_analytics,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(actionCreators, dispatch),
});

const Settings = ({
  eventTable,
  gaWebPropertyId,
  controlAnalyticsEventTable,
  setGoogleAnalyticsWebPropertyId,
  startAnalytics,
}) => {
  const [webPropertyId, setWebPropertyId] = useState("");

  const applyGoogleAnalyticsWebPropertyId = useCallback(() => {
    setGoogleAnalyticsWebPropertyId(webPropertyId);
    startAnalytics({
      serviceType: "VIDYO_CONNECTORANALYTICSSERVICETYPE_Google",
      trackingID: webPropertyId,
    });
    setWebPropertyId("");
  }, [webPropertyId, setGoogleAnalyticsWebPropertyId, startAnalytics]);

  return (
    <div className="ga-popup">
      <fieldset className="ga-web-property-fieldset">
        <legend>Web Property ID ({gaWebPropertyId ?? "default"})</legend>
        <InputGroup
          className="ga-web-property-input"
          onChange={(event) => setWebPropertyId(event.target.value.trim())}
          value={webPropertyId}
          small={true}
        />
        <Button
          className="ga-web-property-cancel"
          onClick={() => setWebPropertyId("")}
          intent={Intent.SUCCESS}
          small={true}
          text={"Cancel"}
        />
        <Button
          onClick={() => applyGoogleAnalyticsWebPropertyId()}
          intent={Intent.SUCCESS}
          small={true}
          text={"Apply"}
        />
      </fieldset>
      <fieldset>
        <legend>Analytics Event Table</legend>
        <table>
          <thead>
            <tr>
              <td>Category</td>
              <td>Action</td>
              <td>Status</td>
            </tr>
          </thead>
          <tbody>
            {Object.entries(eventTable).map(([eventCategory, actionsObj]) => {
              return Object.entries(actionsObj).map(
                ([eventAction, isEnabled]) => (
                  <tr key={`${eventCategory}_${eventAction}`}>
                    <td>{eventCategory}</td>
                    <td>{eventAction}</td>
                    <td>
                      <Checkbox
                        checked={isEnabled}
                        className={Classes.INTENT_PRIMARY}
                        onChange={() => {
                          controlAnalyticsEventTable({
                            eventCategory,
                            eventAction,
                            enable: !isEnabled,
                          });
                        }}
                      />
                    </td>
                  </tr>
                )
              );
            })}
          </tbody>
        </table>
      </fieldset>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
