const notImplemented = (methodName) => {
  return Promise.reject(`${methodName} is not implemented`);
};

class BaseClosedCaptionsProvider {
  async startCaptions(url, jwtToken) {
    return notImplemented("startCaptions");
  }

  async stopCaptions(url, jwtToke) {
    return notImplemented("stopCaptions");
  }

  async subscribeOnTopic(subscriptionToken, callback) {
    return notImplemented("subscribeOnTopic");
  }

  async unsubscribeFromTopic(subscriptionToken) {
    return notImplemented("unsubscribeFromTopic");
  }
}

export default BaseClosedCaptionsProvider;
