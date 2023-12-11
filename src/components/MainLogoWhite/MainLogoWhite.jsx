import React from "react";
import MainLogo from "assets/Logo_white.svg";
import { test } from "utils/helpers";
import "./MainLogoWhite.scss";

const MainLogoWhite = (props) => (
  <div className="main-logo-white" {...test("VIDYOCONNECT_LOGO")}>
    <img alt="Logo" src={MainLogo} {...props} />
  </div>
);

export default React.memo(MainLogoWhite);
