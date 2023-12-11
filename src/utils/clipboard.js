class ClipBoard {
  checkPermission(clipboardEventType) {
    let type = "";

    switch (clipboardEventType) {
      case "write":
        type = "clipboard-write";
        break;
      case "read":
        type = "clipboard-read";
        break;
      default:
        type = "clipboard-write";
        break;
    }

    if (!navigator.permissions) {
      return Promise.resolve(true);
    }
    return navigator.permissions.query({ name: type }).then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        return true;
      } else {
        throw new Error(`No permission to ${type}`);
      }
    });
  }

  copyText(text) {
    return this.checkPermission("write")
      .then(() => {
        return navigator.clipboard.writeText(text).then(
          () => {
            return true;
          },
          () => {
            throw new Error("Copy failed");
          }
        );
      })
      .catch((e) => {
        console.log(`Clipboard error: ${e}`);
        return false;
      });
  }

  getCopiedText() {
    return this.checkPermission("read")
      .then(() => {
        return navigator.clipboard.readText();
      })
      .catch((e) => {
        console.log(`Clipboard error: ${e}`);
        return false;
      });
  }
}

const clipBoard = new ClipBoard();

export default clipBoard;
