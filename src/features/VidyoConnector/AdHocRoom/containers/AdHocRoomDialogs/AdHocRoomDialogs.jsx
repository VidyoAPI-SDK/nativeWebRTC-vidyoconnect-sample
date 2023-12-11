import React, { useState, useEffect, useRef } from "react";
import { Button, Classes, Dialog, Icon, Spinner } from "@blueprintjs/core";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Alert from "components/Alert";
import "./AdHocRoomDialogs.scss";

const AdHocRoomDialogs = ({ onJoin }) => {
  const adHocRoom = useSelector((state) => state.vc_adHocRoom);
  const [isAdHocRoomDialogOpen, showAdHocRoomDialog] = useState(false);
  const adHocRoomRef = useRef(adHocRoom);
  const { t } = useTranslation();

  useEffect(() => {
    if (
      (adHocRoomRef.current.isCreated !== adHocRoom.isCreated &&
        adHocRoom.isCreated) ||
      adHocRoom.error
    ) {
      showAdHocRoomDialog(true);
    }
  }, [adHocRoom]);

  if (adHocRoom.isLoading) {
    return (
      <Dialog isOpen={true} className="adhoc-room-dialog__success">
        <center className={Classes.DIALOG_BODY}>
          <h4>{t("Creating room...")}</h4>
          <Spinner className="bp5-intent-white" />
        </center>
      </Dialog>
    );
  }

  if (adHocRoom.error) {
    return (
      <Alert
        className="popup-with-button"
        message={{ header: adHocRoom.error }}
        buttonText={t("CLOSE")}
        onConfirm={() => showAdHocRoomDialog(false)}
        isOpen={isAdHocRoomDialogOpen}
      />
    );
  }

  function wrapLinks(text) {
    return text?.replace(
        /(?:(https?:\/\/[^\s]+))/gm,
        '<a href="$1" target="_blank">$1</a>'
    );
  }

  return (
    <>
      {adHocRoom.isCreated && !isAdHocRoomDialogOpen && (
        <Icon icon="info-sign" onClick={() => showAdHocRoomDialog(true)} />
      )}
      <Dialog
        title=""
        icon={<Icon icon="info-sign" size={14} />}
        isCloseButtonShown={true}
        isOpen={isAdHocRoomDialogOpen}
        className="adhoc-room-dialog__success"
        onClose={() => showAdHocRoomDialog(false)}
      >
        <div className={Classes.DIALOG_BODY}>
          <pre
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{
                __html: wrapLinks(adHocRoom.inviteContent),
              }}
          />
          <Button
            fill={true}
            className={Classes.INTENT_SUCCESS}
            onClick={onJoin}
          >
            {t("JOIN")}
          </Button>
        </div>
      </Dialog>
    </>
  );
};

export default AdHocRoomDialogs;
