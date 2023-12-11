import React from "react";
import { Dialog as BluePrintDialog } from "@blueprintjs/core";

import "./Dialog.scss";

const Dialog = ({
  isOpen,
  canOutsideClickClose,
  className,
  buttons,
  header,
  content,
  shouldReturnFocusOnClose,
}) => {
  return (
    <BluePrintDialog
      isOpen={isOpen}
      canOutsideClickClose={canOutsideClickClose}
      portalClassName={"vc-dialog-portal"}
      className={`vc-dialog ${className ?? ""}`}
      shouldReturnFocusOnClose={shouldReturnFocusOnClose}
    >
      {header && <div className="vc-dialog__header">{header}</div>}
      {content?.html && (
        <div
          className="vc-dialog__content"
          dangerouslySetInnerHTML={{
            __html: content.html,
          }}
        ></div>
      )}
      {content?.message && (
        <div className="vc-dialog__content">{content.message}</div>
      )}
      {buttons?.length && (
        <div className="vc-dialog__buttons">
          {buttons.map((button, index) => {
            return (
              <button
                onClick={button.onClick}
                className={`vc-dialog__button ${button.className ?? "primary"}`}
                key={`${button.title}_${index}`}
              >
                {button.title}
              </button>
            );
          })}
        </div>
      )}
    </BluePrintDialog>
  );
};

export default Dialog;
