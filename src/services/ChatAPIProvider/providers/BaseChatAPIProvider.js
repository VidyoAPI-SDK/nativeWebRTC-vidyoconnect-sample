const notImplemented = (methodName) => {
  return Promise.reject(`${methodName} is not implemented`);
};

class BaseChatAPIProvider {
  async init(params) {
    return notImplemented("init");
  }
  async addMessageClass(params) {
    return notImplemented("addMessageClass");
  }
  async joinChat(params) {
    return notImplemented("joinChat");
  }
  async leaveChat() {
    return notImplemented("joinChat");
  }
  async getChatHistory(params) {
    return notImplemented("getHistory");
  }
  async subscribeOnChatEvents(chat, onEvent) {
    return notImplemented("subscribeOnChatEvents");
  }
  async unsubscribeFromChatEvents(chat) {
    return notImplemented("unsubscribeFromChatEvents");
  }
  async subscribeOnChatMessages(chat, onChanged, onNewMessageReceived) {
    return notImplemented("subscribeOnChatMessages");
  }
  async unsubscribeFromChatMessages(chat) {
    return notImplemented("unsubscribeFromChatMessages");
  }
  async sendChatMessage(params) {
    return notImplemented("sendChatMessage");
  }
  async sendPrivateChatMessage(params) {
    return notImplemented("sendPrivateChatMessage");
  }
  async sendGroupChatMessage(params) {
    return notImplemented("sendGroupChatMessage");
  }
}

export default BaseChatAPIProvider;
