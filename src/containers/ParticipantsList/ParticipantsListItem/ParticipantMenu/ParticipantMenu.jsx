import { Popover, Position } from "@blueprintjs/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { Stethoscope } from "features";
import { test } from "utils/helpers";
import "./ParticipantMenu.scss";

const ParticipantMenu = ({
  isLocal,
  cameraOn,
  pinTitle,
  isUserRoomOwner,
  isUserAdmin,
  disconnectParticipantClickHandler,
  item,
  isMenuOpen,
  openParticipantMenuClickHandler,
  pinClickHandler,
}) => {
  const { t } = useTranslation();

  return (
    <Popover
      content={
        <div className="participant-nav" {...test("PARTICIPANT_MENU")}>
          <ul className="participant-nav__list">
            <li
              className={`participant-nav__list-item ${
                (isLocal || !cameraOn) && "disabled"
              }`}
              role="button"
              tabIndex="0"
              aria-disabled={isLocal || !cameraOn ? "true" : "false"}
              onClick={pinClickHandler.bind(null, item)}
              {...test("PIN_PARTICIPANT_TOGGLE")}
            >
              <span className="participant-nav__icon participant-nav__icon--pin"></span>
              <span className="participant-nav__title">{pinTitle}</span>
            </li>
            <Stethoscope.ParticipantListMenuItem participant={item} />
            {(isUserRoomOwner || isUserAdmin) && (
              <li
                role="button"
                tabIndex="0"
                className="participant-nav__list-item"
                onClick={disconnectParticipantClickHandler.bind(null, item)}
                {...test("DISCONECT_PARTICIPANT")}
              >
                <span className="participant-nav__icon participant-nav__icon--disconnect"></span>
                <span className="participant-nav__title">
                  {t("CM_DISCONNECT_PARTICIPANT")}
                </span>
              </li>
            )}
          </ul>
        </div>
      }
      interactionKind="click"
      popoverClassName="participant-menu-popover"
      position={Position.BOTTOM}
      isOpen={isMenuOpen}
      portalClassName="participant-menu-popover-wrapp"
      onClose={openParticipantMenuClickHandler.bind(null, null)}
      onOpened={() => {
        document.querySelector(".participant-nav__list-item")?.focus();
      }}
      shouldReturnFocusOnClose
    >
      <button
        aria-label={t("OPEN_PATRICIPANT_MENU")}
        aria-haspopup="menu"
        className="participant-list-item__btn"
        onClick={openParticipantMenuClickHandler.bind(null, item?.objId)}
        {...test("PARTICIPANT_MENU_TOGGLE")}
      ></button>
    </Popover>
  );
};

export default React.memo(ParticipantMenu);
