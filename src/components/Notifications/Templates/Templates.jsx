import React, { memo } from "react";
import { useHTMLMessageFormatting } from "utils/hooks";
import TeamplateWithButtons from "./CustomBannerTemplateWithBtns/CustomBannerTemplateWithBtns";

const Templates = ({
  type = "default",
  data = {},
  closeNotification = () => {},
}) => {
  const [formatMessage] = useHTMLMessageFormatting();
  const renderTemplate = () => {
    switch (type) {
      case "banner":
        return (
          <div className="notification-content banner">
            {data.icon && (
              <div className="notification-icon">
                <img src={data.icon} alt="" />
              </div>
            )}
            <div className="notification-body">
              {data.title && (
                <div className="notification-title">
                  <span>{data.title}</span>
                </div>
              )}
              {data.message && (
                <div className="notification-message">
                  <span>
                    {data?.parseLinks
                      ? formatMessage(data.message)
                      : data.message}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      case "bannerWithBtns":
        return (
          <TeamplateWithButtons
            data={data}
            closeNotification={closeNotification}
          />
        );
      default:
        return (
          <div className="notification-content default">
            <img src={data.icon} alt="" />
            <p>{data.message}</p>
          </div>
        );
    }
  };

  return renderTemplate();
};

export default memo(Templates);
