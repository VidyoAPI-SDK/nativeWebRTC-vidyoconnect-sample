import React from "react";
import { Position, Toaster } from "@blueprintjs/core";
import "./Notifications.scss";
import Templates from "./Templates/Templates";

//https://blueprintjs.com/docs/#core/components/toast

const params = new URLSearchParams(window.location.search);
const isWebViewEnabled = ["true", "1"].includes(
  params.get("initializeWebView")
);

const Notification = Toaster.create({
  className: `notification${isWebViewEnabled ? " web-view" : ""}`,
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

const customToasters = new WeakMap();
const onDismiss = (timer) => {
  // function to perform any task after notification dismiss
};
export const showNotification = (type, data, customContainer) => {
  if (!data) {
    return null;
  }
  let _notification = Notification;

  const key = (++index + Date.now() * Math.random()).toString();
  let className = toastsAdditionalClasses[type] || "";

  if (data.className) {
    className += ` ${data.className.trim()}`;
  }

  if (customContainer) {
    if (customToasters.has(customContainer)) {
      _notification = customToasters.get(customContainer);
    } else {
      _notification = Toaster.create(
        {
          className: "notification",
          position: Position.TOP_RIGHT,
        },
        customContainer
      );
      customToasters.set(customContainer, _notification);
    }
  }

  return _notification.show(
    {
      message: (
        <Templates
          type={type}
          data={data}
          closeNotification={() => _notification.dismiss(key)}
        />
      ),
      className: className,
      timeout: +data.showFor || 5000,
      onDismiss: data.onDismiss || onDismiss,
    },
    data.key || key
  );
};

export const dismissNotification = (key) => {
  return Notification.dismiss(key);
};

export default showNotification;
