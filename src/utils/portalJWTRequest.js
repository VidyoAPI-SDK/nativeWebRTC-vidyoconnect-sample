import axios from "axios";
import { setJwtToken } from "store/actions/config";
import store from "../store/store";
import { getPortalRefreshTokenUrl } from "./helpers";

const handleError = (error) => {
  console.error(
    `Portal JWT Request: Error:: ${JSON.stringify(error?.toJSON?.(), null, 2)}`
  );
};

const axiosJWTInstance = axios.create({
  responseType: "json",
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  if (failedQueue.length) {
    console.log("Portal JWT Request: processQueue");
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    failedQueue = [];
  }
};

const refreshTokenRequest = async (originalRequest, error) => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      // if refresh in proggress just add this function to queue of faliled request and resolve after refresh will done
      console.log(
        "Portal JWT Request: refress was in proggress, wait and return new token"
      );
      failedQueue.push({ resolve, reject });
    });
  }
  const refreshToken = store.getState().config.refreshToken;
  const portal = store.getState().config?.urlPortal?.value || null;
  const options = {
    url: getPortalRefreshTokenUrl(portal),
    method: "GET",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  };

  if (originalRequest) originalRequest._retry = true;
  isRefreshing = true;

  try {
    console.log("Portal JWT Request: Get refresh token");
    const response = await axiosJWTInstance(options);
    const newJWTToken = response?.data?.data?.jwtToken;

    store.dispatch(setJwtToken(newJWTToken));

    axiosJWTInstance.defaults.headers.common["Authorization"] =
      "Bearer " + newJWTToken;
    if (originalRequest)
      originalRequest.headers["Authorization"] = "Bearer " + newJWTToken;

    processQueue(null, newJWTToken);

    if (error) {
      console.log(
        `Portal JWT Request: Retry failed request ${error.config.url} with new token`
      );
    }
    return originalRequest
      ? await axiosJWTInstance(originalRequest)
      : newJWTToken;
  } catch (error) {
    processQueue(error, null);
    return await Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
};

axiosJWTInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    handleError(error);

    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (error.config.url?.includes?.("/api/v1/refreshToken")) {
      console.log(
        `Portal JWT Request: Error on refresh token request for URL = ${error.config.url}`
      );
      return Promise.reject(error);
    }

    if (!originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          console.log(
            "Portal JWT Request: jwt is refreshing now. Put request to queue."
          );
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axiosJWTInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      try {
        return await refreshTokenRequest(originalRequest, error);
      } catch (e) {
        return await Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

const portalJWTRequest = (options) => {
  options.headers = options.headers ?? {};
  options.transitional = options.transitional ?? {};

  console.log("Portal JWT Request: init new request to: ", options.url);

  if (!options.url?.includes?.("/api/v1/refreshToken")) {
    const jwtToken = store.getState().config.jwtToken;
    options.headers["Authorization"] = "Bearer " + jwtToken;
  }
  if (!options.autoContentType) {
    options.headers["Content-Type"] =
      options.headers?.["Content-Type"] || "application/json";
  }
  options.headers.Accept = options.headers?.Accept || "application/json";

  options.transitional.clarifyTimeoutError = true;

  return new Promise((resolve, reject) => {
    axiosJWTInstance(options)
      .then((response) => {
        console.log(
          `Portal JWT Request: request to: ${options.url} has finished.`
        );
        return resolve(response);
      })
      .catch((error) => reject(error));
  });
};

export { axiosJWTInstance, portalJWTRequest, refreshTokenRequest };
