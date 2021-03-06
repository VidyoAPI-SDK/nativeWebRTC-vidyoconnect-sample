import React from "react";
import { Position, Toaster } from "@blueprintjs/core";
import "./Notifications.scss";
import Templates from "./Templates/Templates";

//https://blueprintjs.com/docs/#core/components/toast

const Notification = Toaster.create({
  className: "notification",
  position: Position.TOP_RIGHT,
});
let index = 0;

const toastsAdditionalClasses = {
  bannerWithBtns: "order-1 hide-default-btn disable-animation-if-not-on-top", // such as we reorder list of notification by css need to disable animation for not first item to avoid side effect
  banner: "order-2",
  default: "order-2",
};

export const Classes = Object.freeze({
  UNDISMISSABLE: "undismissable",
});

export const showNotification = (type, data) => {
  if (!data) {
    return null;
  }
  const key = (++index + Date.now() * Math.random()).toString();
  let className = toastsAdditionalClasses[type] || "";

  if (data.className) {
    className += ` ${data.className.trim()}`;
  }

  return Notification.show(
    {
      message: (
        <Templates
          type={type}
          data={data}
          closeNotification={() => Notification.dismiss(key)}
        />
      ),
      className: className,
      timeout: +data.showFor || 5000,
    },
    key
  );
};

export const dismissNotification = (key) => {
  return Notification.dismiss(key);
};

export default showNotification;
