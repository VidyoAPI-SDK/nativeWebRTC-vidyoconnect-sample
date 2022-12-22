import axios from "axios";
import { setJwtToken } from "store/actions/config";
import store from "../store/store";
import { getPortalRefreshTokenUrl } from "./helpers";

const handleError = (error) => {
  if (error.response) {
    console.log("Portal JWT Request: Error data -", error.response.data);
    console.log("Portal JWT Request: Error status -", error.response.status);
    console.log("Portal JWT Request: Error headers -", error.response.headers);
  } else if (error.request) {
    console.log("Portal JWT Request: Error request - ", error.request);
  } else {
    console.log("Portal JWT Request: Error message - ", error.message);
  }
};

const axiosJWTInstance = axios.create({
  responseType: "json",
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const portalJWTRequest = (options) => {
  return new Promise((resolve, reject) => {
    axiosJWTInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        handleError(error);

        const originalRequest = error.config;

        if (error.response.status !== 401) {
          return new Promise((_, reject) => {
            reject(error);
          });
        }

        if (error.config.url?.includes?.("/api/v1/refreshToken")) {
          return new Promise((_, reject) => {
            console.log(
              `Portal JWT Request: Error on refresh token request for URL = ${error.config.url}`
            );
            reject(error);
          });
        }

        if (!originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
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

          const refreshToken = store.getState().config.refreshToken;
          const portal = store.getState().config?.urlPortal?.value || null;
          const options = {
            url: getPortalRefreshTokenUrl(portal),
            method: "GET",
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          };

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            console.log("Portal JWT Request: Get refresh token");
            const response = await axiosJWTInstance(options);
            const newJWTToken = response?.data?.data?.jwtToken;

            store.dispatch(setJwtToken(newJWTToken));

            axiosJWTInstance.defaults.headers.common["Authorization"] =
              "Bearer " + newJWTToken;
            originalRequest.headers["Authorization"] = "Bearer " + newJWTToken;

            processQueue(null, newJWTToken);

            console.log(
              `Portal JWT Request: Retry failed request ${error.config.url} with new token`
            );
            return await axiosJWTInstance(originalRequest);
          } catch (error) {
            processQueue(error, null);
            return await Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    axiosJWTInstance(options)
      .then((response) => resolve(response))
      .catch((error) => reject(error));
  });
};

export { axiosJWTInstance, portalJWTRequest };
