import React, { useCallback, useEffect, useRef, useState } from "react";
import { throttle } from "throttle-debounce";
import "./ClosedCaptionsView.scss";

// eslint-disable-next-line no-unused-vars
const MSG_BEGAN = "B";
const MSG_UPDATED = "U";
const MSG_FINNISHED = "F";
const DEFAULT_BLACK_COLOR = "#000000";
const DEFAULT_WHITE_COLOR = "#ffffff";
const DEFAULT_FONT_SIZE = "18px";
const LINE_HEIGHT_COEFICIENT = 1.5;
const LINES_IN_HISTORY = 8;

// TODO remove after testing!!!!
let showCCinConsole = false;
window.switchCCMessagesInLogs = () => (showCCinConsole = !showCCinConsole);

const parseCaptionMessage = (message) => {
  const isMessageTextEmpty = message.trim().endsWith("]");
  const messagePropertyarray = message.split("]");
  // take everything between 1 index and the last index as a username
  const userNameArr = messagePropertyarray
    .slice(2, -1)
    .join("]")
    ?.trim()
    .replace("[", "")
    .split(" ");
  const firstName = userNameArr[0];
  const lastName = userNameArr[1] || "";
  const text = isMessageTextEmpty
    ? ""
    : messagePropertyarray[messagePropertyarray.length - 1].trim();
  return {
    index: messagePropertyarray[0].trim().replace("[", ""),
    flag: messagePropertyarray[1].trim().replace("[", ""),
    userName: `${firstName} ${lastName}`.trim(),
    text,
    timestamp: Date.now(),
  };
};

const isElementScrolledToBottom = (element) => {
  if (element) {
    return (
      Math.abs(
        element.scrollHeight - element.clientHeight - element.scrollTop
      ) < 5
    ); // not always corecct but near to 90-95% and this is the only way to detect
  } // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#problems_and_solutions
};

const getLineHeight = () => parseInt(_fontSize) * LINE_HEIGHT_COEFICIENT;

let _messagesQueue = [];
let _mesagges = [];
let _fontSize = parseInt(DEFAULT_FONT_SIZE);

const ClosedCaptionsView = ({
  subscribeOnMesaages = () => {},
  unsubscribeFromMessages = () => {},
  uiOptions = {},
  scrolltrigger,
}) => {
  const {
    fontSize = DEFAULT_FONT_SIZE,
    backColor = DEFAULT_BLACK_COLOR,
    fontColor,
    test = () => {},
    isSafari = false,
  } = uiOptions;
  const _fontColor =
    fontColor || backColor === DEFAULT_WHITE_COLOR
      ? DEFAULT_BLACK_COLOR
      : DEFAULT_WHITE_COLOR;
  const [mesagges, _setMessages] = useState([]);
  const ccLinesRef = useRef();
  const isDocumentVisible = useRef(true);
  _fontSize = parseInt(fontSize);

  const setMessages = useCallback(
    (msgArrProp) => {
      let msgArr = msgArrProp;
      if (!isDocumentVisible.current) {
        // if browser not visible, keep ony last few lines in memory for performance in case if user long time have minimized browser
        msgArr = msgArr.slice(-LINES_IN_HISTORY - 2);
      }
      _setMessages([...msgArr]);
      _mesagges = [...msgArr];
    },
    [_setMessages]
  );

  useEffect(() => {
    const getTime = () => {
      const fontCof = _fontSize === 18 ? 1 : _fontSize > 18 ? 0.7 : 1.3;
      if (ccLinesRef.current?.clientWidth) {
        return Math.min(
          Math.max(ccLinesRef.current.clientWidth * 2 * fontCof, 1000),
          2500
        );
      }
    };
    let timeout = null;
    const scroll = () => {
      if (
        ccLinesRef.current &&
        !isElementScrolledToBottom(ccLinesRef.current)
      ) {
        ccLinesRef.current?.scrollBy(0, getLineHeight());
      }
      timeout = setTimeout(scroll, getTime());
    };
    timeout = setTimeout(scroll, getTime());

    return () => {
      clearTimeout(timeout);
    };
  }, [fontSize]);

  useEffect(() => {
    if (ccLinesRef.current) {
      // scroll to bottom if font changed
      ccLinesRef.current.scrollTo({
        top: ccLinesRef.current.scrollHeight,
        behavior: "instant",
      });
    }
  }, [fontSize, scrolltrigger]);

  useEffect(() => {
    const scrollOnVissibilityChange = () => {
      if (ccLinesRef.current && document.visibilityState === "visible") {
        isDocumentVisible.current = true;
        _mesagges = _mesagges.slice(-LINES_IN_HISTORY);
        ccLinesRef.current.scrollTo({
          top: ccLinesRef.current.scrollHeight,
          behavior: "instant",
        });
      } else {
        isDocumentVisible.current = false;
      }
    };
    document.addEventListener("visibilitychange", scrollOnVissibilityChange);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        scrollOnVissibilityChange
      );
      _messagesQueue = [];
      _mesagges = [];
    };
  }, []);

  useEffect(() => {
    const handeMsg = (parsedMsg) => {
      const lastMessage = _mesagges[_mesagges.length - 1];

      if (!_mesagges.length) {
        setMessages([parsedMsg]);
      } else if (lastMessage?.index === parsedMsg.index) {
        if (parsedMsg.flag === MSG_FINNISHED) {
          if (isElementScrolledToBottom(ccLinesRef.current)) {
            // add messages from queue and clear prvious msgs
            if (lastMessage?.flag === MSG_FINNISHED) {
              const lastFewMsgs = _mesagges.slice(-LINES_IN_HISTORY);
              setMessages([...lastFewMsgs, parsedMsg, ..._messagesQueue]);
            } else {
              const lastFewMsgs = _mesagges.slice(-LINES_IN_HISTORY - 1);
              lastFewMsgs.pop(); // remove last massge in updated state
              setMessages([...lastFewMsgs, parsedMsg, ..._messagesQueue]);
            }
            _messagesQueue = [];
          } else {
            // add messages from queue
            if (lastMessage?.flag !== MSG_FINNISHED) {
              // replase last message with flag Updated or Begun for the same speaker
              _mesagges.pop();
            }
            setMessages([..._mesagges, parsedMsg, ..._messagesQueue]);
            _messagesQueue = [];
          }
        } else {
          if (lastMessage?.flag !== MSG_FINNISHED) {
            // replase last message with flag Updated or Begun for the same speaker
            _mesagges.pop();
          }
          setMessages([..._mesagges, parsedMsg]);

          const distanceToBottom = Math.abs(
            ccLinesRef.current.scrollHeight -
              ccLinesRef.current.clientHeight -
              ccLinesRef.current.scrollTop
          );
          if (
            distanceToBottom > 0 &&
            distanceToBottom < getLineHeight() * 1.2 // 20% margin for possible measurement error
          ) {
            // scroll to bottom if we show current speaker cc and next line is hedden
            // this shoud not impact scrolling messegas from queue, they will be scroled with interval
            ccLinesRef.current.scrollTo({
              top: ccLinesRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      } else {
        if (
          lastMessage.flag === MSG_FINNISHED ||
          (Date.now() - lastMessage.timestamp > 5000 && // sometimes we dont receive finish message, in that case wait adn procced with next msgs
            isElementScrolledToBottom(ccLinesRef.current))
        ) {
          setMessages([..._mesagges, parsedMsg]);
        } else if (parsedMsg.flag === MSG_FINNISHED) {
          _messagesQueue.push(parsedMsg);
        }
      }
    };

    const handeMsgWithThrottling = throttle(250, handeMsg, {
      noTrailing: true,
    });

    subscribeOnMesaages((msg) => {
      if (!ccLinesRef?.current) return;
      if (showCCinConsole) {
        console.warn(msg);
      }
      let parsedMsg = parseCaptionMessage(msg);
      const lastMsg = _mesagges[_mesagges.length - 1];

      // sometime we receive message without text
      if (!parsedMsg.text) {
        if (
          parsedMsg?.flag === MSG_FINNISHED &&
          lastMsg?.index === parsedMsg.index &&
          lastMsg?.flag !== MSG_FINNISHED
        ) {
          lastMsg.flag = MSG_FINNISHED;
          return;
        } else {
          return;
        }
      }

      if (
        lastMsg?.index === parsedMsg.index &&
        lastMsg?.flag === parsedMsg.flag &&
        parsedMsg.flag === MSG_UPDATED
      ) {
        // if it is update for curent speaker, try throttle
        handeMsgWithThrottling(parsedMsg);
      } else {
        handeMsg(parsedMsg);
      }
    });
    return () => {
      unsubscribeFromMessages();
    };
  }, [setMessages, subscribeOnMesaages, unsubscribeFromMessages]);

  const sizeOfFont =
    parseInt(fontSize) === 18
      ? "normal"
      : parseInt(fontSize) > 18
      ? "big"
      : "small";

  return (
    <React.Fragment>
      <div
        className="caption-container"
        aria-hidden
        style={{
          backgroundColor: backColor,
          color: _fontColor,
          fontSize: fontSize,
        }}
        {...test("CAPTION_BAR")}
      >
        <div
          ref={ccLinesRef}
          className={`cc-lines-wrapper font-${sizeOfFont}${
            isSafari ? " safari" : ""
          }`}
        >
          {mesagges.map((msg) => (
            <div className="cc-line-wrapper" key={msg.timestamp}>
              <div className="cc-line" {...test("CAPTION_MRSSAGE_AREA")}>
                <div className="cc-name-wrapper">
                  <div className="cc-name">{msg.userName}</div>
                  <div>:</div>
                </div>
                <div className="cc-text">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default ClosedCaptionsView;
