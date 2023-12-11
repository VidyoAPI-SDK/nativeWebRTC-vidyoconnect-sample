import React, { useState } from "react";
import {
  Button,
  Checkbox,
  Classes,
  Intent,
  Label,
  NumericInput,
  Popover,
  Position,
} from "@blueprintjs/core";
import { GoogleAnalytics } from "features/VidyoConnector";
import * as actionCreators from "../actions/creators";
import StatsAnalyzerLink from "./StatsAnalyzerLink";
import { useMediaQuery } from "react-responsive";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import LogLevels from "./LogLevels";
import "./AdvancedSettings.scss";

const mapStateToProps = ({ vc_advancedConfig }) => ({
  ...vc_advancedConfig,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(actionCreators, dispatch),
});

const AdvancedSettings = ({
  isAutoReconnectEnabled,
  isAudioOnlyModeEnabled,
  isCompositorFixedParticipantsEnabled,
  isConnectorApiLoggingEnabled,
  isScreenShareSimulcastEnabled,
  isSimpeApiLoggingEnabled,
  isStatsDisabled,
  isStatsOverlayDisplayed,
  isVideoSimulcastEnabled,
  maxReconnectAttempts,
  reconnectBackoff,
  participantLimit,
  setParticipantLimit,
  disableStats,
  setAudioOnlyMode,
  setAutoReconnect,
  setCompositorFixedParticipants,
  setConnectorApiLogging,
  setVideoSimulcast,
  setScreenShareSimulcast,
  setSimpeApiLogging,
  setMaxReconnectAttempts,
  setReconnectBackoff,
  showStatisticsOverlay,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      onClose={() => setIsOpen(false)}
      popoverClassName={Classes.POPOVER_CONTENT_SIZING}
      isOpen={isOpen}
      content={
        <div className="vidyo-advanced-settings">
          <fieldset>
            <Checkbox
              checked={isStatsOverlayDisplayed}
              onChange={() => showStatisticsOverlay(!isStatsOverlayDisplayed)}
              className={Classes.INTENT_PRIMARY}
              label={"Show Statistics Overlay"}
            />
            <Checkbox
              checked={isAudioOnlyModeEnabled}
              onChange={() => setAudioOnlyMode(!isAudioOnlyModeEnabled)}
              className={Classes.INTENT_PRIMARY}
              label={"Enable Audio-Only Mode"}
            />
            <Checkbox
              checked={isCompositorFixedParticipantsEnabled}
              onChange={() =>
                setCompositorFixedParticipants(
                  !isCompositorFixedParticipantsEnabled
                )
              }
              className={Classes.INTENT_PRIMARY}
              label={"Enable Compositor Fixed Participants"}
            />
            <Checkbox
              checked={isVideoSimulcastEnabled}
              onChange={() => setVideoSimulcast(!isVideoSimulcastEnabled)}
              className={Classes.INTENT_PRIMARY}
              label={"Enable Video Simulcast"}
            />
            <Checkbox
              checked={isScreenShareSimulcastEnabled}
              onChange={() =>
                setScreenShareSimulcast(!isScreenShareSimulcastEnabled)
              }
              className={Classes.INTENT_PRIMARY}
              label={"Enable Screen Share Simulcast"}
            />
            <Checkbox
              checked={isStatsDisabled}
              onChange={() => disableStats(!isStatsDisabled)}
              className={Classes.INTENT_PRIMARY}
              label={"Disable Stats (reconnect)"}
            />
            <Label>
              Participant Limit
              <NumericInput
                allowNumericCharactersOnly={true}
                onValueChange={(value) => setParticipantLimit(value)}
                placeholder="Enter a number..."
                value={participantLimit}
                fill={true}
                min={0}
              />
            </Label>
          </fieldset>
          <GoogleAnalytics.Settings />
          <fieldset>
            <legend>Auto-reconnect</legend>
            <Checkbox
              checked={isAutoReconnectEnabled}
              onChange={() => setAutoReconnect(!isAutoReconnectEnabled)}
              className={Classes.INTENT_PRIMARY}
              label={"Enable Auto-Reconnect"}
            />
            <Label>
              Max Reconnect Attempts
              <NumericInput
                allowNumericCharactersOnly={true}
                onValueChange={(value) => setMaxReconnectAttempts(value)}
                placeholder="Enter a number..."
                value={maxReconnectAttempts}
                fill={true}
                min={0}
              />
            </Label>
            <Label>
              Reconnect Backoff
              <NumericInput
                allowNumericCharactersOnly={true}
                onValueChange={(value) => setReconnectBackoff(value)}
                placeholder="Enter a number..."
                value={reconnectBackoff}
                fill={true}
                min={0}
              />
            </Label>
          </fieldset>
          <fieldset>
            <legend>Enable API logging</legend>
            <Checkbox
              checked={isSimpeApiLoggingEnabled}
              onChange={() => setSimpeApiLogging(!isSimpeApiLoggingEnabled)}
              className={Classes.INTENT_PRIMARY}
              label={"VidyoSimple API"}
            />
            <Checkbox
              checked={isConnectorApiLoggingEnabled}
              onChange={() =>
                setConnectorApiLogging(!isConnectorApiLoggingEnabled)
              }
              className={Classes.INTENT_PRIMARY}
              label={"VidyoConnector API"}
            />
          </fieldset>
          <fieldset className="log-levels">
            <legend>Log levels</legend>
            <Popover
              position={
                useMediaQuery({ query: "(max-width: 753px)" })
                  ? Position.BOTTOM_RIGHT
                  : Position.BOTTOM_LEFT
              }
              content={<LogLevels />}
              usePortal={false}
              fill={true}
            >
              <Button
                intent={Intent.PRIMARY}
                text={"Show Log Levels"}
                small={true}
                fill={true}
              />
            </Popover>
          </fieldset>
          <fieldset className="stats-analyzer-link">
            <StatsAnalyzerLink />
          </fieldset>
        </div>
      }
    >
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="vidyo-advanced-settings-button"
        intent={Intent.PRIMARY}
        text={"Advanced Settings"}
        small={true}
      />
    </Popover>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings);
