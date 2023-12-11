import {
  UPDATE_USER,
  SET_USER,
  LOGOUT,
  RESET_USER,
  MODERATION_STATUS_UPDATE,
} from "./types/user";

export const updateUser = (data) => ({
  type: UPDATE_USER,
  data,
});

export const setUser = (data) => ({
  type: SET_USER,
  data,
});

export const resetUser = (data) => ({
  type: RESET_USER,
  data,
});

export const logout = () => ({
  type: LOGOUT,
});

export const userModerationStatusUpdate = (status) => ({
  type: MODERATION_STATUS_UPDATE,
  payload: status,
});
