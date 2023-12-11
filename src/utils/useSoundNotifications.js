import { useEffect } from "react";
import { useSelector } from "react-redux";
import incomingParticipant from "../assets/audio/incoming_participant.wav";

const URLParams = new URLSearchParams(document.location.search);
const offSound = URLParams.get("offNotificationsSound");

const audioElements = {};

try {
  if (!offSound) {
    const incomingParticipantSound = new Audio(incomingParticipant);
    audioElements["incomingParticipantSound"] = incomingParticipantSound;
  }
} catch (e) {
  console.warn("Error while creating audio elements ", e);
}

const useSoundNotifications = () => {
  const selectedSpeaker = useSelector((state) => state.devices.selectedSpeaker);

  useEffect(() => {
    try {
      for (const audioElement of Object.values(audioElements)) {
        if (audioElement.setSinkId && selectedSpeaker?.id) {
          //Reload audio before setSinkId to avoid issue with no sound after unplugging the active speaker
          audioElement.pause();
          audioElement.load();
          audioElement
            .setSinkId(selectedSpeaker.id)
            .then(() => {
              console.info(
                "Sucessfully attached sinkid for " + selectedSpeaker.id
              );
            })
            .catch(() => {
              console.error(
                "Error while  attaching sinkid for " + selectedSpeaker.id
              );
            });
        }
      }
    } catch (e) {
      console.error("Error while  attaching sinkid for " + selectedSpeaker.id);
    }
  }, [selectedSpeaker]);

  return audioElements;
};

export default useSoundNotifications;
