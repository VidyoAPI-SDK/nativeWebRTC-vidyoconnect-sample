import React, { memo, useState, useEffect } from "react";

function updateTimerText(countdownNumber, setCountdownNumber, autoclick) {
  let timerTime = countdownNumber;

  const interval = setInterval(() => {
    timerTime -= 1;
    setCountdownNumber(timerTime);

    if (timerTime <= 0) {
      clearInterval(interval);
      autoclick();
    }
  }, 1000);
  return interval;
}

function Timer({ buttonData, autoclick }) {
  const [countdownNumber, setCountdownNumber] = useState(
    buttonData.autoClickAfterNSeconds
  );
  const interval = updateTimerText(
    countdownNumber,
    setCountdownNumber,
    autoclick
  );
  useEffect(() => () => clearInterval(interval));
  return (
    <div className="countdown-for-button" aria-hidden="true">
      <svg className="countdown-for-button-loader" width="22" height="22">
        <circle
          r="10"
          cx="11"
          cy="11"
          className="countdown-for-button-circle"
          style={{
            animation:
              "countdownForButton " +
              buttonData.autoClickAfterNSeconds +
              "s linear forwards",
          }}
        ></circle>
      </svg>
      <div className="countdown-for-button-number">{countdownNumber}</div>
    </div>
  );
}
export default memo(Timer);
