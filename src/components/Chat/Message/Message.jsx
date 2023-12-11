import React, { useState } from "react";
import { test } from "utils/helpers";
import "./Message.scss";

const Message = React.forwardRef(
  (
    {
      isSent,
      timestamp,
      messageBody,
      participantName,
      participantAvatar,
      groupOpen = true,
      groupClose = true,
    },
    ref
  ) => {
    const [isExpanded, setExpanded] = useState(false);
    let msgClassName = "chat-message-wrapper";

    if (groupOpen) {
      msgClassName += " message-group-top";
    }
    if (groupClose) {
      msgClassName += " message-group-bottom";
    }
    if (isExpanded) {
      msgClassName += " message-expanded";
    }
    if (isSent) {
      msgClassName += " message-sent";
    }

    const handleDoubleClick = () => {
      setExpanded(!isExpanded);
    };

    return (
      <div ref={ref} className={msgClassName}>
        <div className="message-avatar-wrapper">{participantAvatar}</div>
        <div className="message-content">
          <span className="message-header">{participantName}</span>
          <span
            className="message-bubble"
            {...test("CHAT_MESSAGE")}
            onDoubleClick={handleDoubleClick}
          >
            {messageBody}
          </span>
          <span className="message-footer">{timestamp}</span>
        </div>
      </div>
    );
  }
);

export default React.memo(Message);
