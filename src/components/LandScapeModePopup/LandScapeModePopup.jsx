import React from "react";
import "./LandScapeModePopup.scss";

const LandScapeModePopup = ({ title }) => {
  return (
    <div className="landscape-popup">
      <div
        className="landscape-popup__title"
        dangerouslySetInnerHTML={{
          __html: title,
        }}
      ></div>
      <div className="landscape-popup__icon"></div>
    </div>
  );
};

export default LandScapeModePopup;
