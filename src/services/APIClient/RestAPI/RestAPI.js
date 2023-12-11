import axios from "axios";

const RestAPI = {
  async getCustomParameters({ host, authToken }) {
    try {
      const requestParams = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (authToken) requestParams.headers.Authorization = `Basic ${authToken}`;

      const response = await axios.get(
        `https://${host.replace(
          "https://",
          ""
        )}/api/v1/tenants/customParameters`,
        requestParams
      );
      if (response.status === 200) {
        const preparedData = {
          registered: null,
          unregistered: null,
        };
        const convertResponse = (data, type) => {
          preparedData[type] = {};
          Array.isArray(data) &&
            data.forEach((item) => {
              preparedData[type][item.key] = item.value;
            });
        };

        if (response.data.data.registered) {
          convertResponse(response.data.data.registered, "registered");
        }

        if (response.data.data.unregistered) {
          convertResponse(response.data.data.unregistered, "unregistered");
        }

        return preparedData;
      }
      return Promise.reject(new Error("Status code is not 200"));
    } catch (e) {
      return Promise.reject(e);
    }
  },

  async getGCPServicesList({ vidyoCloudServicesURL }) {
    try {
      const result = await axios.get(vidyoCloudServicesURL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return result.data;
    } catch (e) {
      return Promise.reject(e);
    }
  },

  async sendSMS({ url, portal, authToken, number, sms }) {
    try {
      const result = await axios.post(
        url,
        {
          body: sms,
          portal: portal,
          to: [number],
        },
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: authToken,
          },
        }
      );
      return result.data;
    } catch (e) {
      return Promise.reject(e);
    }
  },
};

export default RestAPI;
