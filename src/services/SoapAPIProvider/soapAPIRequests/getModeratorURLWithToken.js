import { getSoapProvider } from "../SoapApiProvider";

const scheme = (roomID, pin) => {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
  <soapenv:Header/>
  <soapenv:Body>
      <v1:getModeratorURLWithToken>
          <v1:roomID>${roomID}</v1:roomID>
      </v1:getModeratorURLWithToken>
  </soapenv:Body>
</soapenv:Envelope>`;
};

const soapProvider = getSoapProvider();

export const getModeratorURLWithTokenRequest = (portal, token, roomID, pin) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme(roomID, pin),
      "getModeratorURLWithToken",
      token
    )
    .catch((err) => {
      console.error(`getModeratorURLWithToken error -> ${err}`);
    });
};
