import React, { useCallback } from "react";
import { Classes, MenuItem } from "@blueprintjs/core";
import { useSelector, useDispatch } from "react-redux";
import { selectCamera } from "store/actions/devices";
import GeneralSelectList from "components/GeneralSelectList";
import camera from "assets/images/buttons/camera.svg";
import { useTranslation } from "react-i18next";
import { test, sortDevices } from "utils/helpers";

const CameraSelectList = () => {
  const selectedCamera = useSelector((state) => state.devices.selectedCamera);

  const cameraMuteControlToggle = useSelector(
    (state) => state.config.urlCameraMuteControl.value
  );

  const cameras = useSelector((state) => state.devices.cameras);
  const sortedCameras = sortDevices(cameras);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onItemSelect = useCallback(
    (localCamera) => {
      dispatch(selectCamera(localCamera));
    },
    [dispatch]
  );

  const customRenderItem = (item, { index, handleClick }) => (
    <MenuItem
      className={item.selected && Classes.ACTIVE}
      onClick={handleClick}
      text={item.name}
      key={index}
      {...test("SELECT_CAMERA_ITEM")}
    />
  );

  return (
    <div className="device-select-container">
      <GeneralSelectList
        title={t("CAMERA")}
        icon={camera}
        disabled={!cameraMuteControlToggle}
        items={sortedCameras}
        customRenderItem={customRenderItem}
        className="camera-select"
        onItemSelect={onItemSelect}
        selectedItemName={
          selectedCamera ? selectedCamera.name : t("NO_ACTIVE_CAMERA")
        }
        noResultsText={t("NO_CAMERA")}
        buttonProps={{
          ...test("SELECT_CAMERA"),
        }}
      />
    </div>
  );
};

export default CameraSelectList;
