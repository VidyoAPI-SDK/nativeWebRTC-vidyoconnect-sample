import { getCallAPIProvider } from "services/CallAPIProvider/CallAPIProvider";

const { default: BaseBreakoutRoomsProvider } = require("./BaseProvider");

class WebProvider extends BaseBreakoutRoomsProvider {
  constructor(baseUrl = "") {
    super();

    this.baseUrl = baseUrl;
  }

  async subscibeOnCallTransfer(
    onTransferring,
    onTransferred,
    onTransferFailed
  ) {
    return getCallAPIProvider().subscribeOnBreakoutRooms(
      onTransferring,
      onTransferred,
      onTransferFailed
    );
  }

  async unsubscibeFromCallTransfer() {
    return getCallAPIProvider().unsubscribeFromBreakoutRooms();
  }

  async subscribeOnBroadcastMessages(onBroadcastMessage) {
    return getCallAPIProvider().subscribeOnBroadcastMessages(
      onBroadcastMessage
    );
  }

  async unsubscribeFromBroadcastMessages() {
    return getCallAPIProvider().unsubscribeFromBroadcastMessages();
  }

  async raiseHand(statusCallback) {
    return getCallAPIProvider().raiseHand(statusCallback);
  }

  async unraiseHand() {
    return getCallAPIProvider().unraiseHand();
  }

  async comeBackToMainRoom() {
    try {
      return await getCallAPIProvider().exitBreakoutRoom();
    } catch (error) {
      return Promise.reject(error ?? "Error while comeBackToMainRoom");
    }
  }
}

export default WebProvider;
