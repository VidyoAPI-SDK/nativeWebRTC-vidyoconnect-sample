import SoapAPI from "./providers/SoapAPI";

let selectedProvider = null;

export const getSoapProvider = () => {
  if (selectedProvider) {
    return selectedProvider;
  }

  let provider = window.appConfig.REACT_APP_SOAP_API_PROVIDER;

  if (provider === "SoapAPI") {
    selectedProvider = new SoapAPI();
  }

  window.soapProvider = selectedProvider;
  return selectedProvider;
};
