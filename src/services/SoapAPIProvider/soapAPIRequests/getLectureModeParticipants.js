import { getSoapProvider } from "../SoapApiProvider";

const scheme = (conferenceID, pin) => {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
     <soapenv:Header/>
     <soapenv:Body>
        <v1:GetLectureModeParticipantsRequest>
           <v1:conferenceID>${conferenceID}</v1:conferenceID>
           <v1:moderatorPIN>${pin}</v1:moderatorPIN>
        </v1:GetLectureModeParticipantsRequest>
     </soapenv:Body>
  </soapenv:Envelope>`;
};

const soapProvider = getSoapProvider();

export const getLectureModeParticipantsRequest = (
  portal,
  authToken,
  conferenceID,
  pin
) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme(conferenceID, pin),
      "getLectureModeParticipants",
      authToken
    )
    .catch((err) => {
      console.error(`getLectureModeParticipants error -> ${err}`);
    });
};
