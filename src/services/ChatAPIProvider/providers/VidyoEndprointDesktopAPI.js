import BaseChatAPIProvider from "./BaseChatAPIProvider";
import { getCallAPIProvider } from "../../CallAPIProvider";

class VidyoEndpointDesktopAPI extends BaseChatAPIProvider {
  constructor() {
    if (VidyoEndpointDesktopAPI.instance) {
      return VidyoEndpointDesktopAPI.instance;
    }
    super();
    VidyoEndpointDesktopAPI.instance = this;
  }

  init() {
    this.callProvider = getCallAPIProvider();
  }

  joinChat(params) {
    return Promise.resolve(true);
  }

  leaveChat() {
    return Promise.resolve(true);
  }

  subscribeOnChatMessages(chat, onChanged, onNewMessageReceived) {
    return this.callProvider.vidyoRoom?.RegisterMessageEventListener?.({
      onMessageReceived: onNewMessageReceived,
      onMessageAcknowledged: () => {},
      onMessageRead: () => {},
      onMessageTypingIndication: () => {},
    });
  }

  unsubscribeFromChatMessages(chat) {
    return this.callProvider.vidyoRoom?.UnregisterMessageEventListener?.();
  }

  sendChatMessage({ message }) {
    return this.callProvider.vidyoRoom
      ?.SendMessage?.({ message })
      .then(() => {
        return Promise.resolve({
          senderType: "VIDYO_CHATMESSAGESENDERTYPE_User",
          type: "VIDYO_CHATMESSAGETYPE_Chat",
          objType: "VidyoChatMessage",
          timestamp: Date.now(),
          body: message,
        });
      })
      .catch((e) => console.log("sendChatMessage error: ", e));
  }
}

export default VidyoEndpointDesktopAPI;
