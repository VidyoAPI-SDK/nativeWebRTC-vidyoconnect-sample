import { SET_FULLSCREEN } from "./types";

export const setFullscreen = (enable) => ({
  type: SET_FULLSCREEN,
  enable,
});
