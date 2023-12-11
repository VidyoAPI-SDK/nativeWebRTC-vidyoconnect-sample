import { getSoapProvider } from "../SoapApiProvider";

const getPortalVersionScheme = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gues="http://portal.vidyo.com/guest">
<soapenv:Header/>
<soapenv:Body>
    <gues:GetPortalVersionRequest>?</gues:GetPortalVersionRequest>
</soapenv:Body>
</soapenv:Envelope>`;

const soapProvider = getSoapProvider();

export const getPortalVersion = (url) => {
  url = !/^https?:\/\//i.test(url)
    ? `https://${url}/services/VidyoPortalGuestService/`
    : url;
  return soapProvider
    .send(url, getPortalVersionScheme, "getPortalVersion")
    .then((data) => {
      const portalVersionData =
        data?.Envelope?.Body?.GetPortalVersionResponse?.portalVersion || [];
      return portalVersionData;
    })
    .catch((err) => {
      console.error(`getPortalVersion error -> ${err}`);
    });
};
