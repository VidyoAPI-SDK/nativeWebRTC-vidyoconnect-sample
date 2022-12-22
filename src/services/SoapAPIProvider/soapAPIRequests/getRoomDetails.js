import { getSoapProvider } from "../SoapApiProvider";

const scheme = (roomKey) => {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gues="http://portal.vidyo.com/guest">
            <soapenv:Header/>
               <soapenv:Body>
                  <gues:GetRoomDetailsByRoomKeyRequest>
                     <gues:roomKey>${roomKey}</gues:roomKey>
                  </gues:GetRoomDetailsByRoomKeyRequest>
               </soapenv:Body>
            </soapenv:Envelope>`;
};

const soapProvider = getSoapProvider();

const transformToBoolean = (value) => {
  if (value === "true") {
    return true;
  } else if (value === "false") {
    return false;
  }
  return value;
};

export const getRoomDetails = (url, roomKey) => {
  url = !/^https?:\/\//i.test(url) ? `https://${url}` : url;
  return soapProvider
    .send(
      `${url}/services/VidyoPortalGuestService/`,
      scheme(roomKey),
      "getRoomDetailsByRoomKey"
    )
    .then((data) => {
      const roomDetails =
        data?.Envelope?.Body?.GetRoomDetailsByRoomKeyResponse || {};
      for (let property in roomDetails) {
        roomDetails[property] = transformToBoolean(roomDetails[property]);
      }
      return roomDetails;
    })
    .catch((err) => {
      console.error(`getRoomDetails error -> ${err}`);
    });
};
