import { getSoapProvider } from "../SoapApiProvider";

const scheme = (
  roomKey
) => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
<soapenv:Header/>
<soapenv:Body>
    <v1:GetEntityByRoomKey>
        <v1:roomKey>${roomKey}</v1:roomKey>
    </v1:GetEntityByRoomKey>
</soapenv:Body>
</soapenv:Envelope>`;

const soapProvider = getSoapProvider();

export const getEntityByRoomKey = (portal, token, roomKey) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme(roomKey),
      "getEntityByRoomKey",
      token
    )
    .then((data) => {
      return data?.Envelope?.Body?.GetEntityByRoomKeyResponse?.Entity;
    })
    .catch((err) => {
      console.error(`getEntityByRoomKey error -> ${err}`);
    });
};
