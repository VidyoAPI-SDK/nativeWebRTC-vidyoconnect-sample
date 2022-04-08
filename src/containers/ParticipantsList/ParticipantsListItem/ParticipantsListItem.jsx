import { Position, Tooltip } from "@blueprintjs/core";
import React from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { pinParticipant, unpinParticipant } from "store/actions/call";
import { getInitials, test } from "utils/helpers";
import ParticipantMenu from "./ParticipantMenu/ParticipantMenu";
import "./ParticipantsListItem.scss";

const ParticipantsListItem = ({
  unsafeName,
  microphoneOn,
  isUserRoomOwner,
  micMuteClickHandler,
  camMuteClickHandler,
  isGuest,
  cameraOn,
  isLocal,
  pinTitle,
  isUserAdmin,
  isBecomeModerator,
  disconnectParticipantClickHandler,
  isMenuOpen,
  openParticipantMenuClickHandler,
  item,
  pinnedParticipantId,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const pinClickHandler = useCallback(
    (item) => {
      pinnedParticipantId === item.id
        ? dispatch(unpinParticipant(item))
        : dispatch(pinParticipant(item));
    },
    [pinnedParticipantId, dispatch]
  );

  return (
    <div className="participant-list-item" {...test("PARTICIPANT")}>
      <div className="person-container">
        <div className="avatar" {...test("PARTICIPANT_AVATAR")}>
          {getInitials(unsafeName)}
        </div>
        <div className="status offline"></div>
        <div className="owner_badge"></div>
        <div className="fecc none"></div>
      </div>
      <div className="details-container">
        <div className="details-column">
          <div className="name" {...test("PARTICIPANT_NAME")}>
            {unsafeName}
          </div>
          <div className="additional-info">
            <div className="status-icons">
              {!microphoneOn ? (
                <div
                  className="status-icon_mic"
                  {...test("MICROPHONE_MUTED")}
                ></div>
              ) : (
                // probably need to add additonal check (|| isUserAdmin) after VPTL-13343 will be fixed
                (isBecomeModerator || isUserRoomOwner) && (
                  <Tooltip
                    content={t("CM_SOFT_MUTE_MIC_TIP")}
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    <div
                      className="status-icon_mic active"
                      onClick={micMuteClickHandler.bind(null, item)}
                      {...test("MUTE_PARTICIPANT_MIC")}
                    ></div>
                  </Tooltip>
                )
              )}
              {!cameraOn ? (
                <div
                  className="status-icon_cam"
                  {...test("CAMERA_MUTED")}
                ></div>
              ) : (
                // probably need to add additonal check (|| isUserAdmin) after VPTL-13343 will be fixed
                (isBecomeModerator || isUserRoomOwner) && (
                  <Tooltip
                    content={t("CM_SOFT_MUTE_CAM_TIP")}
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    <div
                      className="status-icon_cam active"
                      onClick={camMuteClickHandler.bind(null, item)}
                      {...test("MUTE_PARTICIPANT_CAM")}
                    ></div>
                  </Tooltip>
                )
              )}
            </div>
            <div className="text guest is-hidden" {...test("GUEST_LABEL")}>
              {isGuest ? t("GUEST_MARK") : ""}
            </div>
            <div
              className="text moderator is-hidden"
              {...test("MODERATOR_LABEL")}
            ></div>
          </div>
        </div>

        <div className="participant-list-item__btn-wrap">
          <ParticipantMenu
            isLocal={isLocal}
            cameraOn={cameraOn}
            pinTitle={pinTitle}
            isUserRoomOwner={isUserRoomOwner}
            isUserAdmin={isUserAdmin}
            disconnectParticipantClickHandler={
              disconnectParticipantClickHandler
            }
            item={item}
            pinClickHandler={pinClickHandler}
            isMenuOpen={isMenuOpen}
            openParticipantMenuClickHandler={openParticipantMenuClickHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ParticipantsListItem);
