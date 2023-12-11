import { getSoapProvider } from "../SoapApiProvider";

const scheme = (roomID, lockRoom, pin) => {
  const type = lockRoom ? "LockRoomRequest" : "UnlockRoomRequest";
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
  <soapenv:Header/>
  <soapenv:Body>
      <v1:${type}>
        <v1:roomID>${roomID}</v1:roomID>
        ${pin ? "<v1:moderatorPIN>" + pin + "</v1:moderatorPIN>" : ""}
      </v1:${type}>
  </soapenv:Body>
  </soapenv:Envelope>`;
};

const soapProvider = getSoapProvider();

export const lockRoomRequest = (
  portal,
  token,
  roomID,
  pin,
  lockRoom = true
) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme(roomID, lockRoom, pin),
      lockRoom ? "lockRoom" : "unlockRoom",
      token
    )
    .catch((err) => {
      console.error(`LockRoom error -> ${err}`);
    });
};
