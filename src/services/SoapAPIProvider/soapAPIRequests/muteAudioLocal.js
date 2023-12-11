import { getSoapProvider } from "../SoapApiProvider";

const scheme = (
  conferenceID,
  participantID,
  pin
) => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
<soapenv:Header/>
<soapenv:Body>
   <v1:MuteAudioLocalRequest>
      <v1:conferenceID>${conferenceID}</v1:conferenceID>
      <v1:participantID>${participantID}</v1:participantID>
      ${pin ? "<v1:moderatorPIN>" + pin + "</v1:moderatorPIN>" : ""}
   </v1:MuteAudioLocalRequest>
</soapenv:Body>
</soapenv:Envelope>`;

const soapProvider = getSoapProvider();

export const muteAudioLocal = (
  portal,
  token,
  conferenceID,
  participantID,
  pin
) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme(conferenceID, participantID, pin),
      "muteAudioLocal",
      token
    )
    .catch((err) => {
      console.error(`muteAudioLocal error -> ${err}`);
    });
};
