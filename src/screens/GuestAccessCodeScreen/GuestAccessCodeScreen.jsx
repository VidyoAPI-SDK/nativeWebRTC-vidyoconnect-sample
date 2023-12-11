import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Navigate, useLocation } from "react-router-dom";
import * as callActionCreators from "store/actions/call";
import * as devicesActionCreators from "store/actions/devices";
import GuestSettingsIcon from "components/GuestSettingsIcon";
import MainLogoWhite from "components/MainLogoWhite";
import AccessCode from "containers/AccessCode";
import Settings from "containers/Settings";
import Modal from "components/Modal";
import { test } from "utils/helpers";

import "./GuestAccessCodeScreen.scss";

const mapStateToProps = ({ call, devices, config }) => ({
  isCallJoining: call.joining,
  selectedCamera: devices.selectedCamera,
  isCameraTurnedOn: devices.isCameraTurnedOn,
  isMicrophoneTurnedOn: devices.isMicrophoneTurnedOn,
  isSpeakerTurnedOn: devices.isSpeakerTurnedOn,
  urlAccessCode: config.urlAccessCode.value,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
  ...bindActionCreators(devicesActionCreators, dispatch),
});

const GuestAccessCodeScreen = ({
  startCall,
  isCallJoining,
  selectedCamera,
  cameraTurnOn,
  cameraTurnOff,
  isCameraTurnedOn,
  microphoneTurnOn,
  microphoneTurnOff,
  isMicrophoneTurnedOn,
  speakerTurnOn,
  speakerTurnOff,
  isSpeakerTurnedOn,
  urlAccessCode,
}) => {
  const location = useLocation();
  const [areSettingsRendered, setSettingsRenderState] = useState(false);

  const incorrectPinTooltip = !!location.state.isRedirectFromAccessCodeScreen;

  const onJoin = useCallback(
    ({ accessCode: roomPin }) => {
      startCall({ ...location.state, roomPin });
    },
    [location, startCall]
  );

  const toggleSettings = useCallback(() => {
    setSettingsRenderState(!areSettingsRendered);
  }, [areSettingsRendered]);

  useEffect(() => {
    if (location.state.isCameraTurnedOn) {
      cameraTurnOn({ selectedCamera });
    } else {
      cameraTurnOff({ selectedCamera });
    }
    return () => {
      cameraTurnOff({ selectedCamera });
    };
    // eslint-disable-next-line
  }, [location, cameraTurnOn, cameraTurnOff]);

  useEffect(() => {
    if (location.state.isMicrophoneTurnedOn) {
      microphoneTurnOn();
    } else {
      microphoneTurnOff();
    }
    return () => {
      microphoneTurnOff();
    };
  }, [location, microphoneTurnOn, microphoneTurnOff]);

  useEffect(() => {
    if (location.state.isSpeakerTurnedOn) {
      speakerTurnOn();
    } else {
      speakerTurnOff();
    }
    return () => {
      speakerTurnOff();
    };
  }, [location, speakerTurnOn, speakerTurnOff]);

  if (isCallJoining) {
    return (
      <Navigate
        to={"/JoiningCallScreen"}
        state={{
          ...location.state,
          isCameraTurnedOn,
          isMicrophoneTurnedOn,
          isSpeakerTurnedOn,
          isRedirectFromAccessCodeScreen: true
        }}
      />
    );
  }

  return (
    <div
      className="guest-access-code-screen"
      {...test("GUEST_ACCESS_CODE_SCREEN")}
    >
      <GuestSettingsIcon onClick={toggleSettings} />
      <div className="content">
        <div className="content-blocks">
          <div className="block-1">
            <MainLogoWhite />
            <AccessCode
              urlAccessCode={urlAccessCode}
              incorrectPinTooltip={incorrectPinTooltip}
              areSettingsRendered={areSettingsRendered}
              onJoin={onJoin}
            />
          </div>
        </div>
      </div>
      <Modal>
        {areSettingsRendered && <Settings onClose={toggleSettings} />}
      </Modal>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GuestAccessCodeScreen);
