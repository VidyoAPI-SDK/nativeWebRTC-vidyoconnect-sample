import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import MainLogoWhite from "../../components/MainLogoWhite";
import { test } from "utils/helpers";
import "./GuestInitialScreen.scss";

class GuestInitialScreen extends Component {
  render() {
    return (
      <div className="guest-initial-screen">
        <div className="content">
          <MainLogoWhite />
          <p className="message" {...test("USE_MEETING_LINK_MESSAGE")}>
            Please use the meeting link to join the call
          </p>
        </div>
      </div>
    );
  }
}

export default withTranslation()(GuestInitialScreen);
