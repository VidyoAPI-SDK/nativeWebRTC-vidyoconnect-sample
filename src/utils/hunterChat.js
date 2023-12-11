class HunterChat {
  _validateMessage(message, type = "string") {
    const msgType = typeof message;
    if (msgType !== type) {
      throw new Error(`Type of message is not valid. Type: ${msgType}`);
    }
  }

  createMessage(
    message,
    specialMessageInfo,
    specMessageExtraData,
    isFeatureMessage,
    featureName
  ) {
    if (!specialMessageInfo) this.message = message;
    else {
      const specMessageClass =
        specialMessageInfo.specMessageClass || "MSGCLASS_CONTROL";
      const specMessageType =
        specialMessageInfo.specMessageType || "MSGTYPE_EMPTY";
      const prepearedMessage = isFeatureMessage
        ? this.prepareFeatureMessage(message, featureName)
        : message;

      this.message = specMessageExtraData
        ? `SpecialMessage::msgClass:${specMessageClass};msgType:${specMessageType};msgExtraData:${specMessageExtraData};messageBody:${prepearedMessage}`
        : `SpecialMessage::msgClass:${specMessageClass};msgType:${specMessageType};messageBody:${prepearedMessage}`;
    }

    console.log("HunterChat: message created - ", this.message);
    return this.message;
  }

  parseSpecialMessage(message) {
    try {
      this._validateMessage(message);

      const specialMessageInfo = {
        specMessageClass: null,
        specMessageType: null,
        specMessageBody: null,
        specMessageExtraData: null,
      };
      const specialMsgContent = message.replace("SpecialMessage::", "");
      const msgParts = specialMsgContent.split(";");

      for (let nn = 0; nn < msgParts.length; nn++) {
        const msgElem = msgParts[nn];
        const msgElemParts = msgElem.split(":");

        switch (msgElemParts[0]) {
          case "msgClass":
            specialMessageInfo.specMessageClass = msgElemParts[1];
            break;
          case "msgType":
            specialMessageInfo.specMessageType = msgElemParts[1];
            break;
          case "msgExtraData":
            specialMessageInfo.specMessageExtraData = msgElemParts[1];
            break;
          case "messageBody":
            specialMessageInfo.specMessageBody = msgElemParts[1];
            break;
          default:
            break;
        }
      }

      return specialMessageInfo;
    } catch (error) {
      console.error(
        `HunterChat: message - parseSpecialMessage error ${error?.message}`
      );
    }
  }

  isSpecialMessage(message) {
    try {
      this._validateMessage(message);

      return message.includes("SpecialMessage::");
    } catch (error) {
      console.error(
        `HunterChat: message - isSpecialMessage() error ${error?.message}`
      );
    }
  }

  parseFetureMessage(message) {
    try {
      this._validateMessage(message);
      const splitedMsg = message.split("|");

      if (Array.isArray(splitedMsg)) {
        const base64 = splitedMsg[1];

        if (base64) {
          return JSON.parse(atob(base64));
        }
      }
    } catch (error) {
      console.error(
        `HunterChat: message - parseFetureMessage error ${error?.message}`
      );
    }
  }

  prepareFeatureMessage(data, featureName) {
    try {
      this._validateMessage(data, "object");

      return `${featureName}|${btoa(JSON.stringify(data))}`;
    } catch (error) {
      console.error(
        `HunterChat: message - prepareFeatureMessage error ${error?.message}`
      );
    }
  }
}

const hunterChat = new HunterChat();

export default hunterChat;
