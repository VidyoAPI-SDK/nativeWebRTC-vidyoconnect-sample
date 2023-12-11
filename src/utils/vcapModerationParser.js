import { userModerationStatusUpdate } from "store/actions/user";
import store from "store/store";

export default class VCAPMessageProcessor {
  static process(message) {
    const parser = new DOMParser();
    const vcapDOM = parser.parseFromString(message, "application/xml");
    const request = vcapDOM.querySelector("Request");

    if (request) {
      Array.from(request.children).forEach((tag) => {
        let cmd;
        switch (tag.tagName) {
          case "vcap:LectureMode":
            cmd = LectureModeCommand.fromXMLDomElement(tag);
            break;
          default:
            // we don't care about other message types
            break;
        }
        if (cmd) {
          cmd.execute();
        }
      });
    }
  }
}

class LectureModeCommand {
  UserStatusUpdate;

  execute() {
    if (this.UserStatusUpdate) {
      store.dispatch(userModerationStatusUpdate(this.UserStatusUpdate));
    }
  }

  static fromXMLDomElement(dom) {
    const cmd = new LectureModeCommand();
    const tag = dom.firstElementChild;
    switch (tag.tagName) {
      case "vcap:UserStatusUpdate": {
        const handDismissed = tag.querySelector("HandDismissedNotification");
        if (handDismissed) {
          cmd.UserStatusUpdate = { handApproved: false };
        }
        break;
      }

      default:
        // we don't care about other message types
        break;
    }
    return cmd;
  }
}
