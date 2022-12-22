import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation } from "react-router-dom";
import * as callActionCreators from "store/actions/call";
import SVGSpinner from "components/SVGSpinner";
import MainLogoWhite from "components/MainLogoWhite";
import { test } from "utils/helpers";
import "./JoiningCallScreen.scss";

const mapStateToProps = ({ call }) => ({
  isCallActive: call.active,
  disconnectReason: call.disconnectReason,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
});

const JoiningCallScreen = ({ isCallActive, disconnectReason }) => {
  const location = useLocation();
  const { t } = useTranslation();

  if (disconnectReason) {
    return disconnectReason === "VIDYO_CONNECTORFAILREASON_InvalidToken" ? (
      <Navigate
        replace
        to={"/GuestAccessCodeScreen"}
        state={location.state}
      />
    ) : (
      <Navigate
        replace
        to={"/GuestBeautyScreen"}
        state={{
          ...location.state,
          isRedirectFromAccessCodeScreen: false
        }}
      />
    );
  }

  if (isCallActive) {
    return (
      <Navigate
        replace
        to={"/GuestInCall"}
        state={{
          ...location.state,
          isRedirectFromAccessCodeScreen: false
        }}
      />
    );
  }

  return (
    <div className="joining-call-screen" {...test("GUEST_JOINING_SCREEN")}>
      <div className="content">
        <MainLogoWhite />
        <div className="initial-loader">
          <SVGSpinner strokeColor="#51575C" />
        </div>
        <div className="message">{t("JOINING_CALL_DOTS")}</div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(JoiningCallScreen);
