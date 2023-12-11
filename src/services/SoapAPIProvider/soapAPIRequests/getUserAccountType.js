import { getSoapProvider } from "../SoapApiProvider";

const scheme = () => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
  <soapenv:Header/>
  <soapenv:Body>
    <v1:getUserAccountTypeRequest />
  </soapenv:Body>
</soapenv:Envelope>`;

const soapProvider = getSoapProvider();

export const getUserAccountType = (portal, token) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme(),
      "getUserAccountType",
      token
    )
    .then((data) => {
      return data?.Envelope?.Body?.getUserAccountTypeResponse?.userAccountType;
    })
    .catch((err) => {
      console.error(`getUserAccountType error -> ${err}`);
    });
};
