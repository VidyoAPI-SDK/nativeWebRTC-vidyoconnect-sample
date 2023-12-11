import { portalJWTRequest } from "utils/portalJWTRequest";
import { getCallAPIProvider } from "services/CallAPIProvider";
import BaseClosedCaptionsProvider from "./BaseProvider";

const errorLog = (error) => {
  console.error("CC:", error);
  return Promise.reject(error);
};

class WebClosedCaptionsProvider extends BaseClosedCaptionsProvider {
  get vidyoConnector() {
    return getCallAPIProvider().vidyoConnector;
  }

  async startCaptions(url) {
    const options = {
      url: `${url}/startClosedCaptioning`,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };
    try {
      const response = await portalJWTRequest(options);
      if (response?.status === 200 && response.data.status === "success") {
        return response.data.data.subscriptionToken;
      }
      throw new Error(
        `Error while starting caption service, status code: ${response?.status}`
      );
    } catch (error) {
      errorLog(error);
    }
  }

  async stopCaptions(url) {
    const options = {
      url: `${url}/stopClosedCaptioning`,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };
    try {
      const response = await portalJWTRequest(options);
      if (response?.status === 200 && response.data.status === "success") {
        return response.data.data;
      }
      throw new Error(
        `Error while stoping caption service, status code: ${response?.status}`
      );
    } catch (error) {
      errorLog(error);
    }
  }

  async subscribeOnTopic(
    topicSubscriptionToken,
    messageCallback,
    statusCallback
  ) {
    try {
      return this.vidyoConnector.SubscribeToTopic({
        topicSubscriptionToken,
        messageCallback,
        statusCallback,
      });
    } catch (error) {
      errorLog(error);
    }
  }

  async unsubscribeFromTopic(topicSubscriptionToken) {
    try {
      return this.vidyoConnector.UnsubscribeFromTopic({
        topicSubscriptionToken,
      });
    } catch (error) {
      errorLog(error);
    }
  }
}

export default WebClosedCaptionsProvider;
