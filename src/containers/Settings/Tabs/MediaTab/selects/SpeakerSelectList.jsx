import React, { useCallback } from "react";
import { Classes, MenuItem } from "@blueprintjs/core";
import { useSelector, useDispatch } from "react-redux";
import { isSafari } from "react-device-detect";
import { selectSpeaker } from "store/actions/devices";
import GeneralSelectList from "components/GeneralSelectList";
import speaker from "assets/images/buttons/speaker.svg";
import { useTranslation } from "react-i18next";
import { test, sortDevices } from "utils/helpers";
import { useSystemDefaultName } from "utils/hooks";

const SpeakerSelectList = () => {
  const selectedSpeaker = useSelector((state) => state.devices.selectedSpeaker);
  const speakers = useSelector((state) => state.devices.speakers);
  const sortedSpeakers = sortDevices(speakers);
  const processName = useSystemDefaultName();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const showDefaultOutputMessage = sortedSpeakers.length === 1 && isSafari;

  const onItemSelect = useCallback(
    (localSpeaker) => {
      dispatch(selectSpeaker(localSpeaker));
    },
    [dispatch]
  );

  const customRenderItem = (item, { index, handleClick }) => (
    <div className="menu-item-wrapper" key={index}>
      <MenuItem
        className={item.selected && Classes.ACTIVE}
        onClick={handleClick}
        text={processName(item)}
        key={index}
        {...test("SELECT_SPEAKER_ITEM")}
      />
      {showDefaultOutputMessage && (
        <div className="default-device-message">
          {t("BROWSER_USES_DEFAULT_DEVICES_MESSAGE")}
        </div>
      )}
    </div>
  );

  return (
    <div className="device-select-container">
      <GeneralSelectList
        title={t("SPEAKER")}
        icon={speaker}
        items={sortedSpeakers}
        customRenderItem={customRenderItem}
        className="speaker-select"
        onItemSelect={onItemSelect}
        selectedItemName={
          selectedSpeaker
            ? processName(selectedSpeaker)
            : t("NO_ACTIVE_SPEAKER")
        }
        noResultsText={t("NO_SPEAKER")}
        buttonProps={{
          ...test("SELECT_SPEAKER"),
        }}
      />
    </div>
  );
};

export default SpeakerSelectList;
