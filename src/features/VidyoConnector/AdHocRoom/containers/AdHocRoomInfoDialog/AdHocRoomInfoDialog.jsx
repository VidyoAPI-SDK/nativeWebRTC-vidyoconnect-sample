import React from "react";
import { Button, Classes, Dialog, Icon } from "@blueprintjs/core";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import "./AdHocRoomInfoDialog.scss";

const AdHocRoomInfoDialog = ({ onClose }) => {
    const adHocRoom = useSelector((state) => state.vc_adHocRoom);
    const { t } = useTranslation();

    function wrapLinks(text) {
        return text?.replace(
            /(?:(https?:\/\/[^\s]+))/gm,
            '<a href="$1" target="_blank">$1</a>'
        );
    }

    return (
        <>
            <Dialog
                title=""
                icon={<Icon icon="info-sign" size={14} />}
                isCloseButtonShown={true}
                isOpen={true}
                className="adhoc-room-dialog__success"
                onClose={() => onClose()}
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
                        onClick={onClose}
                    >
                        {t("CLOSE")}
                    </Button>
                </div>
            </Dialog>
        </>
    );
};

export default AdHocRoomInfoDialog;