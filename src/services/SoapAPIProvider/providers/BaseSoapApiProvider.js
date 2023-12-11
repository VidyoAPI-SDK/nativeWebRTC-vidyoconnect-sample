const notImplemented = (methodName) => {
  return Promise.reject(`${methodName} is not implemented`);
};

class BaseSoapAPIProvider {
  async send(params) {
    return notImplemented("send");
  }
}

export default BaseSoapAPIProvider;
