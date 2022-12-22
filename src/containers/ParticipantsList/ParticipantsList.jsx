import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { bindActionCreators } from "redux";
import {
  unsafeParseTextFromHTMLString,
  getFormattedString,
  saveDoNotShowMessage,
  isDoNotShowMessage,
} from "utils/helpers";
import { useLanguageDirection, useModerationStatuses } from "utils/hooks";
import * as callActionCreators from "store/actions/call";
import { leaveConference } from "services/SoapAPIProvider/soapAPIRequests/leaveConference";
import storage from "utils/storage";
import Alert from "components/Alert/Alert";
import { muteAudioLocal } from "services/SoapAPIProvider/soapAPIRequests/muteAudioLocal";
import { muteVideoLocal } from "services/SoapAPIProvider/soapAPIRequests/muteVideoLocal";
import ParticipantsListItem from "./ParticipantsListItem/ParticipantsListItem";

import "./ParticipantsList.scss";

const mapState = ({ call, devices }, props) => {
  return {
    participants: call.participants,
    props: props,
    remoteCameras: devices.remoteCameras,
    remoteMicrophones: devices.remoteMicrophones,
    isCameraTurnedOn: devices.isCameraTurnedOn,
    isMicrophoneTurnedOn: devices.isMicrophoneTurnedOn,
    conferenceID: call.roomInfo?.entityID,
    roomPIN: call.roomInfo?.RoomMode?.roomPIN,
    participantsDetails: call.participants.detailedList,
    pinnedParticipant: call.participants?.pinned,
  };
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
});

const ParticipantsList = ({
  participants,
  remoteCameras,
  remoteMicrophones,
  isCameraTurnedOn,
  isMicrophoneTurnedOn,
  conferenceID,
  roomPIN,
  participantsDetails,
  pinnedParticipant,
}) => {
  const { t } = useTranslation();
  const languageDirection = useLanguageDirection();
  const [openedParticipantMenuId, setOpenedParticipantMenuId] = useState(null);
  const [popupSettings, setPopupSettings] = useState({});
  const { isUserAdmin, isUserRoomOwner, isUserRegistered, isBecomeModerator } =
    useModerationStatuses();
  const { portal, authToken } = storage.getItem("user") || {};

  const checkCameraMuteState = (name) => {
    return remoteCameras.some((item) => {
      return item.participant.name === name;
    });
  };

  const checkMicrophoneMuteState = (name) => {
    return remoteMicrophones.some((item) => {
      return item.participant.name === name && item.microphoneOn;
    });
  };

  const setParticipantMediaDeviceState = (participant) => {
    if (participant.isLocal) {
      participant.cameraOn = isCameraTurnedOn;
      participant.microphoneOn = isMicrophoneTurnedOn;
    } else {
      participant.cameraOn = checkCameraMuteState(participant.name);
      participant.microphoneOn = checkMicrophoneMuteState(participant.name);
    }
  };

  const toggleParticipantMenuHandler = useCallback((id) => {
    setOpenedParticipantMenuId((prev) => (prev === id ? null : id));
  }, []);

  const getParticipantId = useCallback(
    (participant) => {
      const entityID = (participant?.userId || "").match(/(\d+)/)[0];
      const participantObj = Array.from(participantsDetails).find(
        (el) => el.entityID === entityID
      );
      const participantID = participantObj?.participantID || entityID;

      return participantID;
    },
    [participantsDetails]
  );

  const disconnectParticipantClickHandler = useCallback(
    (participant) => {
      const participantID = getParticipantId(participant);

      setPopupSettings({
        isOpen: true,
        text: getFormattedString(
          t("CM_DISCONNECT_PARTICIPANT_WARNING"),
          participant?.name
        ),
        cancelButtonText: t("CANCEL"),
        buttonText: t("OK"),
        onConfirm: () => {
          setPopupSettings({});
          leaveConference(
            portal,
            authToken,
            conferenceID,
            participantID,
            +roomPIN
          ).then((res) => {
            if (res) {
              console.log(
                `Successfully disconected participant name=${participant?.name}`
              );
            }
          });
        },
        className: "cm-popup cm-popup--center",
        onCancel: () => {
          setPopupSettings({});
        },
      });
    },
    [authToken, conferenceID, getParticipantId, portal, roomPIN, t]
  );

  const micMuteClickHandler = useCallback(
    (participant) => {
      const participantID = getParticipantId(participant);
      let isChecked = false;

      const confirm = () => {
        if (isChecked) {
          saveDoNotShowMessage("CM_SOFT_MUTE_MICROPHONE_WARNING");
        }
        setPopupSettings({});
        muteAudioLocal(
          portal,
          authToken,
          conferenceID,
          participantID,
          roomPIN
        ).then((res) => {
          if (res) {
            console.log(
              `Successfully muted audio for participant name=${participant?.name}`
            );
          }
        });
      };

      if (!isDoNotShowMessage("CM_SOFT_MUTE_MICROPHONE_WARNING")) {
        setPopupSettings({
          isOpen: true,
          text: getFormattedString(
            t("CM_SOFT_MUTE_MICROPHONE_WARNING"),
            participant?.name
          ),
          cancelButtonText: t("CANCEL"),
          buttonText: t("CONTINUE"),
          onConfirm: confirm,
          className: "cm-popup cm-popup--center",
          onCancel: () => {
            setPopupSettings({});
          },
          checkbox: {
            label: t("CM_DO_NOT_SHOW_ANYMORE"),
            checked: isChecked,
            onChange: () => (isChecked = !isChecked),
          },
        });
      } else {
        confirm();
      }
    },
    [authToken, conferenceID, getParticipantId, portal, roomPIN, t]
  );

  const camMuteClickHandler = useCallback(
    (participant) => {
      const participantID = getParticipantId(participant);

      let isChecked = false;

      const confirm = () => {
        if (isChecked) {
          saveDoNotShowMessage("CM_SOFT_MUTE_CAMERA_WARNING");
        }
        setPopupSettings({});
        muteVideoLocal(
          portal,
          authToken,
          conferenceID,
          participantID,
          roomPIN
        ).then((res) => {
          if (res) {
            console.log(
              `Successfully muted video for participant name=${participant?.name}`
            );
          }
        });
      };

      if (!isDoNotShowMessage("CM_SOFT_MUTE_CAMERA_WARNING")) {
        setPopupSettings({
          isOpen: true,
          text: getFormattedString(
            t("CM_SOFT_MUTE_CAMERA_WARNING"),
            participant?.name
          ),
          cancelButtonText: t("CANCEL"),
          buttonText: t("CONTINUE"),
          onConfirm: confirm,
          className: "cm-popup cm-popup--center",
          onCancel: () => {
            setPopupSettings({});
          },
          checkbox: {
            label: t("CM_DO_NOT_SHOW_ANYMORE"),
            checked: isChecked,
            onChange: () => (isChecked = !isChecked),
          },
        });
      } else {
        confirm();
      }
    },
    [authToken, conferenceID, getParticipantId, portal, roomPIN, t]
  );

  useEffect(() => {
    const closePopover = (e) => {
      if (
        e.target &&
        !e.target.closest(".participant-menu-popover-wrapp") &&
        !e.target.closest(".participant-list-item__btn-wrap")
      ) {
        setOpenedParticipantMenuId(null);
      }
    };
    document.addEventListener("click", closePopover);

    return () => {
      document.removeEventListener("click", closePopover);
    };
  }, []);

  return (
    <>
      <Alert
        isOpen={popupSettings.isOpen}
        onConfirm={popupSettings.onConfirm}
        message={{
          text: popupSettings.text,
        }}
        className={popupSettings.className}
        onCancel={popupSettings.onCancel}
        cancelButtonText={popupSettings.cancelButtonText}
        buttonText={popupSettings.buttonText}
        checkbox={popupSettings.checkbox}
      />
      <div className="participants-list-container" dir={languageDirection}>
        <div className="participants-list-header">
          <span>{t("PARTICIPANTS")}</span>
          <span>{`(${participants.list.length})`}</span>
        </div>
        <div className="participants-list-content">
          {participants.list.map((item) => {
            item.guest = item.userId.indexOf("Guest") !== -1;
            if (item.isLocal && isUserRegistered) {
              item.guest = false;
            }
            setParticipantMediaDeviceState(item);

            let unsafeName = unsafeParseTextFromHTMLString(item.name);

            return (
              <ParticipantsListItem
                unsafeName={unsafeName}
                microphoneOn={item.microphoneOn}
                isUserRoomOwner={isUserRoomOwner}
                micMuteClickHandler={micMuteClickHandler}
                camMuteClickHandler={camMuteClickHandler}
                isGuest={item.guest}
                isLocal={item.isLocal}
                cameraOn={item.cameraOn}
                pinTitle={
                  pinnedParticipant?.id === item.id
                    ? t("REMOVE_ALWAYS_SHOW")
                    : t("ALWAYS_SHOW")
                }
                pinnedParticipantId={pinnedParticipant?.id}
                isUserAdmin={isUserAdmin}
                isBecomeModerator={isBecomeModerator}
                disconnectParticipantClickHandler={
                  disconnectParticipantClickHandler
                }
                isMenuOpen={openedParticipantMenuId === item.objId}
                openParticipantMenuClickHandler={toggleParticipantMenuHandler}
                key={item.id}
                item={item}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default connect(
  mapState,
  mapDispatchToProps
)(React.memo(ParticipantsList));
