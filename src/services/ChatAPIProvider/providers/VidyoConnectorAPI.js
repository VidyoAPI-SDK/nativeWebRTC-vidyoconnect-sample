import BaseChatAPIProvider from "./BaseChatAPIProvider";
import { getCallAPIProvider } from "../../CallAPIProvider";

class VidyoConnectorAPI extends BaseChatAPIProvider {
  constructor() {
    if (VidyoConnectorAPI.instance) {
      return VidyoConnectorAPI.instance;
    }
    super();
    VidyoConnectorAPI.instance = this;
  }

  init() {
    const callProvider = getCallAPIProvider();

    if (!callProvider.vidyoConnector) {
      throw new Error(
        "Call API provider should be set to VidyoConnector for using it's Chat API"
      );
    }

    this.vidyoConnector = callProvider.vidyoConnector;
  }

  addMessageClass(msgClass) {
    return this.vidyoConnector.AddMessageClass(msgClass);
  }

  joinChat(params) {
    return Promise.resolve(true);
  }

  leaveChat() {
    return Promise.resolve(true);
  }

  subscribeOnChatMessages(chat, onChanged, onNewMessageReceived) {
    return this.vidyoConnector.RegisterMessageEventListener({
      onChatMessageReceived: onNewMessageReceived,
    });
  }

  unsubscribeFromChatMessages(chat) {
    return this.vidyoConnector.UnregisterMessageEventListener();
  }

  sendChatMessage({ message }) {
    return this.vidyoConnector.SendChatMessage({ message }).then(() => {
      return Promise.resolve({
        senderType: "VIDYO_CHATMESSAGESENDERTYPE_User",
        type: "VIDYO_CHATMESSAGETYPE_Chat",
        objType: "VidyoChatMessage",
        timestamp: Date.now(),
        body: message,
      });
    });
  }
}

export default VidyoConnectorAPI;
