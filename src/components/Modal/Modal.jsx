import React from "react";
import "./Modal.scss";

const Modal = ({ children }) => {
  if (!children) {
    return null;
  }
  return <div className="modal-content">{children}</div>;
};

export default React.memo(Modal);
