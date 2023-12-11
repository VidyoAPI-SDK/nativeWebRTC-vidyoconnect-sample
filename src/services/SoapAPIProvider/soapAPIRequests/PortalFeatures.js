import { getSoapProvider } from "../SoapApiProvider";

const getPortalFeaturesScheme = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gues="http://portal.vidyo.com/guest">
  <soapenv:Header/>
  <soapenv:Body>
    <gues:GetPortalFeaturesRequest>?</gues:GetPortalFeaturesRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

const soapProvider = getSoapProvider();

const transformToBoolean = (value) => {
  if (["true", "1"].includes(value)) {
    return true;
  }
  return false;
};

export const getPortalFeatures = (url) => {
  url = !/^https?:\/\//i.test(url) ? `https://${url}` : url;
  return soapProvider
    .send(url, getPortalFeaturesScheme, "getPortalFeatures")
    .then((data) => {
      const portalFeaturesData =
        data?.Envelope?.Body?.GetPortalFeaturesResponse?.PortalFeature || [];
      return portalFeaturesData.reduce(
        (acc, { feature, enable }) => ({
          ...acc,
          ...{ [feature]: transformToBoolean(enable) },
        }),
        {}
      );
    })
    .catch((err) => {
      console.error(`getPortalFeatures error -> ${err}`);
      return Promise.reject(err);
    });
};
