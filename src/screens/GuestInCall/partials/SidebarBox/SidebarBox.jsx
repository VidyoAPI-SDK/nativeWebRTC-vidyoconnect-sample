import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { CSSTransition } from "react-transition-group";
import { getBreakoutRooms } from "store/selectors/features";
import ParticipantsList from "containers/ParticipantsList/ParticipantsList";
import SidebarModeratorControls from "containers/SidebarModeratorControls/SidebarModeratorControls";
import Sidebar from "components/Sidebar/Sidebar";

const SidebarBox = ({
  isSidebarOpen,
  callName,
  userIsRegistered,
  toggleSidebar,
}) => {
  const { t } = useTranslation();
  const breakoutRooms = useSelector(getBreakoutRooms);

  return (
    <CSSTransition
      in={isSidebarOpen}
      unmountOnExit
      transitionEnterTimeout={300}
      timeout={{ exit: 300 }}
      classNames="open"
    >
      <Sidebar
        isOpen={isSidebarOpen}
        battonAriaLabel={t("PARTICIPANTS_LIST_TOGGLE")}
        content={
          <>
            <div
              tabIndex="0"
              aria-label={`${t("CONFERENCE")}: ${
                breakoutRooms.isRoomBreakout
                  ? breakoutRooms.mainConferenceName + " - " + callName
                  : callName
              }`}
              className="room-name"
            >
              {breakoutRooms.isRoomBreakout ? (
                <>
                  <div className="room-name__br-line">
                    {breakoutRooms.mainConferenceName}
                  </div>
                  <div className="room-name__br-line">{callName}</div>
                </>
              ) : (
                callName
              )}
            </div>
            <ParticipantsList />
            {userIsRegistered && <SidebarModeratorControls />}
          </>
        }
        toggleSidebar={toggleSidebar}
      />
    </CSSTransition>
  );
};

export default memo(SidebarBox);
