import { useState, useEffect } from "react";
import { myAccountRequest } from "../services/SoapAPIProvider/soapAPIRequests/myAccount";
import storage from "utils/storage";

export function useExtDataLogin(rejoin) {
  let extDataLoginParametersExist = false;

  const searchParams = new URLSearchParams(window.location.search);
  const rawPortal = decodeURIComponent(searchParams.get("portal")||'');
  const extData = (searchParams.get("extData") || "").replace(/\s/gi, "+");
  const extDataType = searchParams.get("extDataType");
  const ap = searchParams.get("AP");
  const ebm = searchParams.get("EBM") || "";
  const trimmedPortal = (rawPortal || "")
    .trim()
    .toLowerCase()
    .replace(/^(https?|http):\/\//, "");
  const portal = trimmedPortal ? `https://${trimmedPortal}` : null;

  if (portal && extData && extDataType === "1" && ap === "1") {
    extDataLoginParametersExist = true;
  }

  let [extDataLoginInProgress, setExtDataLoginInProgress] = useState(
    extDataLoginParametersExist && rejoin
  );
  let [extDataLoginResponse, setExtDataLoginResponse] = useState(false);
  let [extDataLoginError, setExtDataLoginError] = useState(false);

  useEffect(
    () => {
      if (!extDataLoginParametersExist) {
        return;
      }
      setExtDataLoginInProgress(true);
      fetch(`${portal}/api/v1/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `VidyoExtData1 ${extData}`,
        },
        body: JSON.stringify({
          loginRequest: {
            ClientType: "W",
            EBM: ebm,
            returnAuthToken: "true",
            returnPortalVersion: "true",
            returnServiceAddress: "true",
            returnNeoRoomPermanentPairingDeviceUserAttribute: "true",
            returnUserRole: "true",
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "failure") {
            setExtDataLoginResponse(data.error.message);
          }
          return data.data.loginResponse;
        })
        .then((loginResponse) => {
          let { authToken } = loginResponse;
          return myAccountRequest(portal, authToken).then((user) => {
            storage.addItem("user", {
              source: "ap",
              authToken: authToken,
              portal: portal,
            });
            storage.addItem("displayName", user.displayName);
            return loginResponse;
          });
        })
        .then((loginResponse) => {
          setExtDataLoginResponse(loginResponse);
          setExtDataLoginInProgress(false);
        })
        .catch((error) => {
          setExtDataLoginError(error);
          setExtDataLoginInProgress(false);
        });
    }, // eslint-disable-next-line
    [
      /* on mount only */
    ]
  );

  return [
    extDataLoginParametersExist,
    extDataLoginInProgress,
    extDataLoginResponse,
    extDataLoginError,
  ];
}
