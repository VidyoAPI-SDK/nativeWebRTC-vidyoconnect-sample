import axios from "axios";
import xml2js from "xml2js";
import BaseSoapAPIProvider from "./BaseSoapApiProvider";

const processors = xml2js.processors;
const parser = new xml2js.Parser({
  explicitArray: false,
  tagNameProcessors: [processors.stripPrefix],
});

class SoapAPI extends BaseSoapAPIProvider {
  constructor() {
    if (SoapAPI.instance) {
      return SoapAPI.instance;
    }
    super();
    SoapAPI.instance = this;
  }

  send(url, schema, action, token) {
    const headers = {
      "Content-Type": "text/xml",
      SOAPAction: action,
    };

    if (token) {
      headers["Authorization"] = `Basic ${token}`;
    }

    return axios
      .post(url, schema, { headers })
      .then((res) => {
        return new Promise((success, failure) => {
          parser.parseString(res?.data, (err, result) => {
            if (err) {
              console.error(`XML parseString error -> ${err}`);
              failure(err);
            } else {
              success(result);
            }
          });
        });
      })
      .catch((err) => {
        console.error(`SOAP request error -> ${err} | Action = ${action}`);
        return Promise.reject(err);
      });
  }
}

export default SoapAPI;
