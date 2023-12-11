import { getSoapProvider } from "../SoapApiProvider";

const scheme = (
  entityID
) => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
  <soapenv:Header/>
  <soapenv:Body>
    <v1:getEntityDetailsByEntityID>
      <v1:entityID>${entityID}</v1:entityID>
    </v1:getEntityDetailsByEntityID>
  </soapenv:Body>
</soapenv:Envelope>`;

const soapProvider = getSoapProvider();

export const getEntityDetailsByID = (portal, token, entityID) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme(entityID),
      "getEntityDetailsByEntityID",
      token
    )
    .then((data) => {
      return (
        data?.Envelope?.Body?.GetEntityDetailsByEntityIDResponse
          ?.EntityDetails || {}
      );
    })
    .catch((err) => {
      console.error(`getEntityDetailsByEntityID error -> ${err}`);
    });
};
