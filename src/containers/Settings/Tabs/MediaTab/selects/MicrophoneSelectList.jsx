import React, { useCallback } from "react";
import { Classes, MenuItem } from "@blueprintjs/core";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectMicrophone } from "store/actions/devices";
import GeneralSelectList from "components/GeneralSelectList";
import EnergyLevel from "components/EnergyLevel";
import mic from "assets/images/buttons/mic.svg";
import { test, sortDevices } from "utils/helpers";
import { useSystemDefaultName } from "utils/hooks";

const MicrophoneSelectList = () => {
  const selectedMicrophone = useSelector(
    (state) => state.devices.selectedMicrophone
  );

  const { urlInitializeWebView } = useSelector(state => state.config);

  const microphoneMuteControlToggle = useSelector(
    (state) => state.config.urlMicrophoneMuteControl.value
  );

  const microphones = useSelector((state) => state.devices.microphones);
  const sortedMicrophones = sortDevices(microphones);
  const processName = useSystemDefaultName();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const showEnergyLevel = false;

  const onItemSelect = useCallback(
    (localMicrophone) => {
      dispatch(selectMicrophone(localMicrophone));
    },
    [dispatch]
  );

  const customRenderItem = (item, { index, handleClick }) => (
    <MenuItem
      className={item.selected && Classes.ACTIVE}
      onClick={handleClick}
      text={processName(item)}
      key={index}
      {...test("SELECT_MICROPHONE_ITEM")}
    />
  );

  return (
    <div className="device-select-container">
      <GeneralSelectList
        title={t("MICROPHONE")}
        icon={mic}
        disabled={!microphoneMuteControlToggle && !urlInitializeWebView}
        items={sortedMicrophones}
        customRenderItem={customRenderItem}
        className="microphone-select"
        onItemSelect={onItemSelect}
        selectedItemName={
          selectedMicrophone
            ? processName(selectedMicrophone)
            : t("NO_ACTIVE_MICROPHONE")
        }
        noResultsText={t("NO_MICROPHONE")}
        buttonProps={{
          ...test("SELECT_MICROPHONE"),
        }}
      />
      {showEnergyLevel && (
        <EnergyLevel
          microphoneId={selectedMicrophone && selectedMicrophone.id}
        />
      )}
    </div>
  );
};

export default MicrophoneSelectList;
