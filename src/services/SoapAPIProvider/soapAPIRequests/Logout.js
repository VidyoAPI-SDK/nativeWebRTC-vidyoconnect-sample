import { getSoapProvider } from "../SoapApiProvider";

const scheme = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
   <soapenv:Header/>
   <soapenv:Body>
      <v1:LogOutRequest/>
   </soapenv:Body>
</soapenv:Envelope>`;

const soapProvider = getSoapProvider();

export const Logout = (portal, token) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme,
      "Logout",
      token
    )
    .then((data) => {
      return data?.Envelope?.Body?.LogOutResponse;
    })
    .catch((err) => {
      console.error(`LogoutRequest error -> ${err}`);
    });
};
