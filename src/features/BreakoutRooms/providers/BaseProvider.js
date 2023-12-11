const notImplemented = (methodName) => {
  return Promise.reject(`${methodName} is not implemented`);
};

class BaseBreakoutRoomsProvider {
  async subscibeOnCallTransfer() {
    return notImplemented("subscibeOnCallTransfer");
  }
  async unsubscibeFromCallTransfer() {
    return notImplemented("unsubscibeFromCallTransfer");
  }
  async subscribeOnBroadcastMessages() {
    return notImplemented("subscribeOnBroadcastMessages");
  }
  async unsubscribeFromBroadcastMessages() {
    return notImplemented("unsubscribeFromBroadcastMessages");
  }
  async raiseHand() {
    return notImplemented("raiseHand");
  }
  async unraiseHand() {
    return notImplemented("unraiseHand");
  }
  async comeBackToMainRoom() {
    return notImplemented("comeBackToMainRoom");
  }
}

export default BaseBreakoutRoomsProvider;
