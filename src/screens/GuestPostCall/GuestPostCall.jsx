import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { bindActionCreators } from "redux";
import * as callActionCreators from "store/actions/call";
import * as devicesActionCreators from "store/actions/devices";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@blueprintjs/core";
import GuestSettingsIcon from "components/GuestSettingsIcon";
import MainLogoWhite from "components/MainLogoWhite";
import Settings from "containers/Settings";
import Modal from "components/Modal";
import { test, isCustomParamEnabled, getFormattedString } from "utils/helpers";
// import { isAndroid } from "react-device-detect";
import * as googleAnalytics from "../../store/actions/googleAnalytics";
import Alert from "components/Alert";
import CallQualityRating from "../../components/CallQualityRating";
import "./GuestPostCall.scss";

const mapStateToProps = ({ config, call }) => ({
  disconnectReason: call.disconnectReason,
  customParameters: config.customParameters,
  isWebViewEnabled: config.urlInitializeWebView.value,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(callActionCreators, dispatch),
  ...bindActionCreators(googleAnalytics, dispatch),
  ...bindActionCreators(devicesActionCreators, dispatch),
});
// let postCallUrlTimer = null;
// const postCallUrlDelay = 5000;

const GuestPostCall = ({
  rejoinCall,
  disconnectReason,
  customParameters,
  gaOpenPostCallURL,
  resetHardwareCheckDevicesState,
  isWebViewEnabled,
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(true);
  // const navigate = useNavigate();
  const { t } = useTranslation();
  const [areSettingsRendered, setSettingsRenderState] = useState(false);
  const [isPostCallUrlOpened, showPostCallUrl] = useState(false);

  const isFailed = // TODO: support different providers
    disconnectReason !== "VIDYO_CONNECTORDISCONNECTREASON_Disconnected";
  // function handleClick() {
  //   clearTimeout(postCallUrlTimer);
  //   if (isAndroid) {
  //     let href = window.location.href;
  //     if (href.search("&hwt=1") !== -1) {
  //       href = href.replace("&hwt=1", "");
  //       window.location.href = href;
  //     } else {
  //       window.location.reload();
  //     }
  //   } else {
  //     rejoinCall();
  //     resetHardwareCheckDevicesState();
  //     navigate("/InitialScreen", { state: { rejoin: true } });
  //   }
  // }

  function toggleSettings() {
    setSettingsRenderState(!areSettingsRendered);
  }

  function openPostCallURL() {
    const reURL =
      // eslint-disable-next-line
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    const postCallURL = customParameters?.postCallURL;

    if (postCallURL) {
      if (reURL.test(postCallURL)) {
        const openWindow = window.open(postCallURL, "_blank");
        if (!openWindow) {
          // postCallUrlTimer = setTimeout(() => {
          //   window.location.href = postCallURL;
          // }, postCallUrlDelay);
        }
        gaOpenPostCallURL(postCallURL);
        showPostCallUrl(true);
      } else {
        console.log(
          "Invalid custom property:",
          "Reason: postCallURL value is set incorrectly"
        );
      }
    } else {
      console.log(
        "Invalid custom property:",
        "Reason: postCallURL property is missed or value is empty"
      );
    }
  }
  useEffect(() => {
    if (!isPostCallUrlOpened) {
      openPostCallURL();
    }
  });

  const closeAlert = () => {
    setIsAlertOpen(false);
  };

  function getDisconnectReasonText(disconnectReasonErrorCode) {
    let errorText = "";
    let errorHeader = t("YOU_ARE_NO_LONGER_IN_CONFERENCE");
    switch (disconnectReasonErrorCode) {
      case "VIDYO_CONNECTORFAILREASON_LostEventServer":
        errorText = getFormattedString(t("MEDIA_CONNECTIVITY_WAS_LOST"), " ");
        errorHeader = t("UNABLE_TO_ESTABLISH_CONNECTION");
        break;
      case "VIDYO_CONNECTORFAILREASON_RoomLocked":
        errorText = t("YOU_CANNOT_JOIN_TO_LOCKED_ROOM");
        errorHeader = t("ROOM_IS_CURRENTLY_LOCKED");
        break;
      case "VIDYO_CONNECTORDISCONNECTREASON_Booted":
        errorText = t("YOU_HAVE_BEEN_DISCONNECTED_BY_MODERATOR");
        break;
      case "VIDYO_CONNECT_FAILREASON_TransferFailed":
      default:
        errorText = t("DISCONNECTED_DUE_TO_PROBLEM");
        break;
    }
    return {
      errorText,
      errorHeader,
    };
  }

  let feedback = {
    isOpen: true,
    message: {
      header: t("PERMISSION_ALERT_HEADER"),
      html: "",
    },
  };
  const [feedbackForm, setFeedfackForm] = useState(feedback);
  const postCallSurveyDisabledWeb = customParameters?.postCallSurveyDisabledWeb;

  if (
    !isCustomParamEnabled(postCallSurveyDisabledWeb) &&
    !isWebViewEnabled &&
    ((isAlertOpen &&
      feedbackForm.isOpen &&
      window.appConfig.REACT_APP_CALL_QUALITY_RATING_POPUP_ENABLED &&
      !isFailed) ||
      (isFailed &&
        !isAlertOpen &&
        feedbackForm.isOpen &&
        window.appConfig.REACT_APP_CALL_QUALITY_RATING_POPUP_ENABLED))
  ) {
    return (
      <CallQualityRating
        buttonText={t("PERMISSION_ALERT_BUTTON")}
        onCancel={() => {
          setFeedfackForm({ isOpen: false });
        }}
        isOpen={feedbackForm.isOpen}
      />
    );
  }

  return (
    <div className="guest-post-call-screen" {...test("GUEST_POST_SCREEN")}>
      <GuestSettingsIcon onClick={toggleSettings} />
      <div className="content">
        <MainLogoWhite />
        <div>
          <div tabIndex="0" id="guest-logout-message">
            <h2
              className="guest-logout-message-title"
              {...test("THANKS_FOR_PARTICIPATING_TITLE")}
            >
              {t("THANKS_FOR_PARTICIPATING")}
            </h2>
            {isFailed && (
              <Alert
                className={"popup-with-button"}
                buttonText={t("OK")}
                onConfirm={closeAlert}
                message={{
                  header: getDisconnectReasonText(disconnectReason).errorHeader,
                  text: getDisconnectReasonText(disconnectReason).errorText,
                }}
                isOpen={isAlertOpen}
              />
            )}
            <p
              className="guest-logout-message-description"
              {...test("DISCONNECT_CALL_DESCRIPTION")}
            >
              To learn more and signup for a new trial account please reach us
              at
              <a
                  href="https://www.vidyo.com/develop-video-app-platform/#contact-us"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                {" "}
                https://www.vidyo.com/develop-video-app-platform/#contact-us
              </a>
            </p>
          </div>
          {/*<Button*/}
          {/*  {...test("REJOIN_BUTTON")}*/}
          {/*  fill={true}*/}
          {/*  onClick={handleClick}*/}
          {/*  className="bp5-intent-success"*/}
          {/*>*/}
          {/*  {t("REJOIN")}*/}
          {/*</Button>*/}
        </div>
      </div>
      <Modal>
        {areSettingsRendered && <Settings onClose={toggleSettings} />}
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GuestPostCall);
