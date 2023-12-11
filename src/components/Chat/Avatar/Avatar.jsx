import React from "react";
import "./Avatar.scss";

const Avatar = ({ src, alt }) => (
  <div className="message-sender-avatar">
    {src ? <img src={src} alt={alt} /> : <span>{alt}</span>}
  </div>
);

export default Avatar;
