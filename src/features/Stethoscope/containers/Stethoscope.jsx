import useNotifications from "../hooks/useNotifications";
import useTileControls from "../hooks/useTileControls";
import ControlPanel from "./ControlPanel";
import ParticipantListMenuItem from "./ParticipantListMenuItem";
import SelectList from "./SelectList";
import "./Stethoscope.scss";

export default () => {
  useNotifications();
  useTileControls();

  return null;
};

export { ParticipantListMenuItem, ControlPanel, SelectList };
