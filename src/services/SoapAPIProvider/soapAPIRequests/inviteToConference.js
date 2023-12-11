import { getSoapProvider } from "../SoapApiProvider";

const scheme = (conferenceID, callNumberOrDevice, pin, entityID) => {
  if (entityID !== "") {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
  <soapenv:Header/>
  <soapenv:Body>
    <v1:InviteToConferenceRequest>
        <v1:conferenceID>${conferenceID}</v1:conferenceID>
        <v1:entityID>${entityID}</v1:entityID>       
        ${pin ? "<v1:moderatorPIN>" + pin + "</v1:moderatorPIN>" : ""}
    </v1:InviteToConferenceRequest>
  </soapenv:Body>
  </soapenv:Envelope>`;
  }

  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
<soapenv:Header/>
<soapenv:Body>
   <v1:InviteToConferenceRequest>
      <v1:conferenceID>${conferenceID}</v1:conferenceID>
      <v1:invite>${callNumberOrDevice}</v1:invite>
      ${pin ? "<v1:moderatorPIN>" + pin + "</v1:moderatorPIN>" : ""}
   </v1:InviteToConferenceRequest>
</soapenv:Body>
</soapenv:Envelope>`;
};

const soapProvider = getSoapProvider();

export const inviteToConference = (
  portal,
  token,
  conferenceID,
  callNumberOrDevice,
  pin,
  entityID = ""
) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme(conferenceID, callNumberOrDevice, pin, entityID),
      "inviteToConference",
      token
    )
    .catch((err) => {
      console.error(`inviteToConference error -> ${err}`);
    });
};
