import { getSoapProvider } from "../SoapApiProvider";

const scheme = (
  params
) => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gues="http://portal.vidyo.com/guest">
   <soapenv:Header/>
   <soapenv:Body>
    <gues:LogInAsGuestRequest>
      <gues:roomKey>${params?.roomKey || ""}</gues:roomKey>
      <gues:guestName>${params?.guestName || ""}</gues:guestName>     
      <!--Optional:-->
      <gues:returnJwtTokens>${
        params?.returnJwtTokens || false
      }</gues:returnJwtTokens>
      ${
        params?.endpointGuid
          ? `<gues:endpointGuid>${params.endpointGuid}</gues:endpointGuid>`
          : ""
      }
    </gues:LogInAsGuestRequest>

   </soapenv:Body>
</soapenv:Envelope>`;

const soapProvider = getSoapProvider();

export const LogInAsGuest = (portal, params = {}) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/VidyoPortalGuestService/`,
      scheme(params),
      "logInAsGuest"
    )
    .then((data) => {
      return data?.Envelope?.Body?.LogInAsGuestResponse;
    })
    .catch((err) => {
      console.error(`LogInAsGuestResponse error -> ${err}`);
    });
};
