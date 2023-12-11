import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Classes, MenuItem } from "@blueprintjs/core";
import { useSelector, useDispatch } from "react-redux";
import otherDevicesImg from "assets/images/buttons/other_devices.svg";
import { selectLocalStethoscope } from "../../actions/creators";
import GeneralSelectList from "components/GeneralSelectList";
import { test, sortDevices } from "utils/helpers";

const SelectList = () => {
  const selectedLocalStethoscope = useSelector(
    (state) => state.feature_stethoscope.selectedLocalStethoscope
  );
  const localStethoscopes = useSelector(
    (state) => state.feature_stethoscope.localStethoscopes
  );
  const sortedLocalStethoscopes = sortDevices(localStethoscopes);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onItemSelect = useCallback(
    async (localStethoscope) => {
      if (localStethoscope.id === selectedLocalStethoscope.id) {
        return;
      }
      dispatch(selectLocalStethoscope(localStethoscope));
    },
    [dispatch, selectedLocalStethoscope]
  );

  if (!localStethoscopes.length) {
    return null;
  }

  const customRenderItem = (item, { handleClick }) => (
    <MenuItem
      className={item.id === selectedLocalStethoscope?.id && Classes.ACTIVE}
      onClick={handleClick}
      text={item.name}
      key={item.id}
      {...test("SELECT_STETHOSCOPE_ITEM")}
    />
  );

  return (
    <div className="device-select-container">
      <GeneralSelectList
        title={t("OTHER_CONNECTED_DEVICES")}
        icon={otherDevicesImg}
        items={sortedLocalStethoscopes}
        customRenderItem={customRenderItem}
        className="microphone-select"
        onItemSelect={onItemSelect}
        selectedItemName={selectedLocalStethoscope?.name}
        buttonProps={{
          ...test("SELECT_STETHOSCOPE"),
        }}
      />
    </div>
  );
};

export default SelectList;
