import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectRemoteStethoscope,
  unselectRemoteStethoscope,
} from "../actions/creators";

export default function useTileControls() {
  const compositorTiles = useSelector((state) => state.call.compositorTiles);
  const { remoteStethoscopes = [], selectedRemoteStethoscope } = useSelector(
    (state) => state.feature_stethoscope
  );
  const dispatch = useDispatch();

  useEffect(() => {
    compositorTiles.forEach(({ element, isApplication, participantId }) => {
      if (isApplication) {
        return;
      }
      const tileControls = element.querySelector(".video-tile-controls");

      if (tileControls) {
        const stethoscope = remoteStethoscopes.find(
          (microphone) => microphone.participant.id === participantId
        );
        const stethoscopeControl = tileControls.querySelector(
          ".tile-control.stethoscope"
        );

        if (stethoscope) {
          let control = stethoscopeControl;

          if (!control) {
            control = document.createElement("div");
            control.className = "tile-control stethoscope";
            tileControls.insertBefore(
              control,
              tileControls.firstElementChild.nextElementSibling
            );
          }

          control.onclick = () => {
            if (stethoscope.id !== selectedRemoteStethoscope?.id) {
              dispatch(selectRemoteStethoscope(stethoscope));
            } else {
              dispatch(unselectRemoteStethoscope());
            }
          };
        } else if (stethoscopeControl && !stethoscope) {
          stethoscopeControl.remove();
        }
      }
    });
  }, [
    compositorTiles,
    remoteStethoscopes,
    selectedRemoteStethoscope,
    dispatch,
  ]);
}
