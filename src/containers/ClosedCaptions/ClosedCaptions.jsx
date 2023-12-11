import React from "react";
import ClosedCaptionsDesktopController from "./ClosedCaptionsDesktopController";
import ClosedCaptionsWebController from "./ClosedCaptionsWebController";

const ClosedCaptions = () => {
  const appType = window.vidyoApp?.getMode?.() === 0 ? "DESKTOP" : "WEB";

  return (
    <>
      {appType === "DESKTOP" ? (
        <ClosedCaptionsDesktopController />
      ) : (
        <ClosedCaptionsWebController />
      )}
    </>
  );
};

export default ClosedCaptions;
