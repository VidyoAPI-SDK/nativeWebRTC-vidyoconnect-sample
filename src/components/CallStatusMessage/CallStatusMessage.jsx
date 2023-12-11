import React from "react";
import "./CallStatusMessage.scss";

const CallStatusMessage = (props) => {
  return (
    <div className="call-status-message-container">
      <div className="call-status-message">
        <div className="only-participant">
          <p className="title">{props.title}</p>
          <p className="description">{props.description}</p>
        </div>
      </div>
    </div>
  );
};

export default CallStatusMessage;
