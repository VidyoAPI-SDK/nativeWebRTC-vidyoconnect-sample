// @TODO revork with store. Probably we need to use cloud function here
// to hide client_secret
import axios from "axios";
import storage from "utils/storage";

const normalizePortal = (portal = "") => {
  return portal
    .trim()
    .toLowerCase()
    .replace(/^(https?|http):\/\//, "");
};

export function getAuthToken(code) {
  const params = new URLSearchParams();
  params.append("code", code);
  params.append("client_id", "VidyoConnectWebRTC");
  params.append("client_secret", "VidyoConnectWebRTC");
  params.append("grant_type", "authorization_code");

  return axios
    .post(`${window.appConfig.REACT_APP_LOGIN_URL}/oauth/token`, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => res.data);
}

export function isUserAuthorized(portal) {
  if (!portal) {
    return false;
  }
  if (portal.charAt(portal.length - 1) === "/") {
    portal = portal.slice(0, -1);
  }
  let storageUser = storage.getItem("user") || null;
  if (!(storageUser?.authToken && storageUser?.portal)) {
    return false;
  }
  const storagePortal =
    storageUser.portal.charAt(storageUser.portal.length - 1) === "/"
      ? storageUser.portal.slice(0, -1)
      : storageUser.portal;

  return normalizePortal(portal) === normalizePortal(storagePortal);
}
