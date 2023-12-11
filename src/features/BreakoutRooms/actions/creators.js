import {
  RAISE_HAND,
  SET_IS_RAISE_HAND_BUTTTON_ACTIVE,
  SET_IS_RAISE_HAND_REQUEST_IN_PROGRESS,
  SET_IS_ROOM_BREAKOUT,
  SET_IS_SHOW_AFTER_MOOVING_NOTIFICATION,
  SET_IS_SHOW_LEFT_DIALOG,
  SET_MAIN_ROOM_NAME,
  SET_TRANSFER_STATUS,
  TRANSFER_STARTED,
  TRANSFER_FINISHED,
  UNRAISE_HAND,
  SET_MAIN_ROOM_ID,
  TRANSFER_FAILED,
} from "./types";

export const transferStarted = () => ({
  type: TRANSFER_STARTED,
});

export const transferFinished = () => ({
  type: TRANSFER_FINISHED,
});

export const transferFailed = () => ({
  type: TRANSFER_FAILED,
});

export const setTransferInProgress = (isInProgress) => ({
  type: SET_TRANSFER_STATUS,
  payload: isInProgress,
});

export const setMainRoomName = (name) => ({
  type: SET_MAIN_ROOM_NAME,
  payload: name,
});

export const setMainRoomId = (id) => ({
  type: SET_MAIN_ROOM_ID,
  payload: id,
});

export const setIsRoomBreakout = (isBreakout) => ({
  type: SET_IS_ROOM_BREAKOUT,
  payload: isBreakout,
});

export const setIsShowAfterMovingNotification = (isShow) => ({
  type: SET_IS_SHOW_AFTER_MOOVING_NOTIFICATION,
  payload: isShow,
});

export const setIsShowBreakoutLeftDialog = (isShow) => ({
  type: SET_IS_SHOW_LEFT_DIALOG,
  payload: isShow,
});

export const breakoutRaiseHand = () => ({
  type: RAISE_HAND,
});

export const breakoutUnraiseHand = () => ({
  type: UNRAISE_HAND,
});

export const setIsRaiseHandButtonActive = (isActive) => ({
  type: SET_IS_RAISE_HAND_BUTTTON_ACTIVE,
  payload: isActive,
});

export const setIsRaiseHandRequestInProgress = (isInProgress) => ({
  type: SET_IS_RAISE_HAND_REQUEST_IN_PROGRESS,
  payload: isInProgress,
});
