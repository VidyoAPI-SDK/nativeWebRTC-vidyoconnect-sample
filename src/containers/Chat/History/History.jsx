import React, { useRef, useEffect, useMemo, Fragment } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  arrayGroupBy,
  getInitials,
  unsafeParseTextFromHTMLString,
} from "utils/helpers";
import Message from "components/Chat/Message";
import Avatar from "components/Chat/Avatar";
import Moment from "react-moment";
import "./History.scss";
import { useHTMLMessageFormatting } from "utils/hooks";

const History = ({ scrollEvent }) => {
  const { t } = useTranslation();
  const lastMsgRef = useRef(null);
  const isHidden = useSelector(({ chat }) => chat.isHidden);
  const history = useSelector(({ chat }) => chat.history);

  const calendarStrings = useMemo(
    () => ({
      lastDay: `[${t("DATETIME_YESTERDAY_AT")}] LT`,
      sameDay: `[${t("DATETIME_TODAY_AT")}] LT`,
    }),
    [t]
  );

  const [formatMessage] = useHTMLMessageFormatting();

  const renderMessages = () => {
    const content = [];

    const groupedHistory = arrayGroupBy(history, (prev, curr) => {
      if (curr.participant && prev.participant) {
        return curr.participant.userId === prev.participant.userId;
      }
      return curr.isSent && prev.isSent;
    });

    groupedHistory.forEach((groups) => {
      content.push(
        ...groups.map((item, i, array) => {
          let { message, participant, isSent } = item;
          let participantName;
          let participantAvatar;
          let isFirstInGroup = i === 0;
          let isLastInGroup = i >= array.length - 1;
          let messageBody = message.body.split("\n").map((item, key) => {
            return (
              <Fragment key={key}>
                {formatMessage(
                  isSent ? unsafeParseTextFromHTMLString(item) : item
                )}
                <br />
              </Fragment>
            );
          });

          let timestamp = message.timestamp;

          if (participant) {
            let fullName = unsafeParseTextFromHTMLString(
              participant.name || ""
            );
            let initials = getInitials(fullName);

            participantName = fullName.split(" ")[0];
            participantAvatar = <Avatar alt={initials} />;
          }

          return (
            <Message
              ref={lastMsgRef}
              key={timestamp}
              isSent={isSent}
              groupOpen={isFirstInGroup}
              groupClose={isLastInGroup}
              messageBody={messageBody}
              participantName={participantName}
              participantAvatar={participantAvatar}
              timestamp={
                <Moment calendar={calendarStrings}>{timestamp}</Moment>
              }
            />
          );
        })
      );
    });

    return content;
  };

  useEffect(() => {
    if (!isHidden && lastMsgRef.current) {
      lastMsgRef.current.scrollIntoView(false);
    }
    // eslint-disable-next-line
  }, [history]);

  return (
    <div className="chat-history" onScroll={scrollEvent}>
      <div className="chat-disclaimer">{t("CHAT_DISCLAIMER")}</div>
      {renderMessages()}
    </div>
  );
};

export default History;
