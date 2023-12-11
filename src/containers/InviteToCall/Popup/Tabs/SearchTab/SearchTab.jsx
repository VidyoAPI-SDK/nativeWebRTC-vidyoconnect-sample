import React, { useState } from "react";
import { useSelector } from "react-redux";
import { searchRooms } from "services/SoapAPIProvider/soapAPIRequests/searchRooms";
import { searchMembers } from "services/SoapAPIProvider/soapAPIRequests/searchMembers";
import { inviteToConference } from "services/SoapAPIProvider/soapAPIRequests/inviteToConference";
import { getEntityDetailsByID } from "services/SoapAPIProvider/soapAPIRequests/getEntityDetailsByID";
import storage from "utils/storage";
import { useTranslation } from "react-i18next";
import {
  test,
  getInitials,
  unsafeParseTextFromHTMLString,
  getFormattedString,
} from "utils/helpers";
import "./SearchTab.scss";
let timeOutHandler = 0;
const SerachTab = ({ closeModal }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [userResultValue, setUserResultValue] = useState([]);
  const [roomResultValue, setRoomResultValue] = useState([]);
  const [progress, setProgress] = useState(false);

  const call = useSelector((state) => state.call);
  const [requestInprogress, setRequestInprogress] = useState(null);

  let { authToken, portal } = storage.getItem("user") || {};

  const inviteCallback = () => {
    setRequestInprogress(false);
    closeModal();
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    let searchText = event.target.value;
    if (timeOutHandler) {
      clearTimeout(timeOutHandler);
    }
    if (searchText.length < 2) {
      clearTimeout(timeOutHandler);
      setUserResultValue([]);
      setRoomResultValue([]);
      setProgress(false);
      return;
    }
    setProgress(true);
    timeOutHandler = setTimeout(() => {
      let start = 0;
      let limit = 50;
      let sortBy = "";
      let sortDir = "";
      searchRooms(
        portal,
        searchText,
        "roomNameOrExtension",
        "legacy",
        start,
        limit,
        sortBy,
        sortDir,
        authToken
      ).then((res) => {
        if (res) {
          setRoomResultValue(res);
        } else {
          setRoomResultValue([]);
        }
        setProgress(false);
      });

      limit = 20;
      searchMembers(
        portal,
        searchText,
        "name",
        "member",
        start,
        limit,
        sortBy,
        sortDir,
        authToken
      ).then((res) => {
        if (res) {
          setUserResultValue(res);
        } else {
          setUserResultValue([]);
        }
        setProgress(false);
      });
    }, 3000);
  };

  const inviteButtonHandle = (e) => {
    const conferenceID = call.roomInfo.entityID;
    let callId = e.target.dataset.id;
    inviteToConference(
      portal,
      authToken,
      conferenceID,
      "",
      +call.roomInfo?.RoomMode?.roomPIN,
      callId
    ).then((res) => {
      if (res?.Envelope?.Body?.InviteToConferenceResponse?.OK === "OK") {
        inviteCallback();
      } else {
        setTimeout(inviteCallback, 1000);
      }
    });
  };

  const getAvatar = (item) => {
    if (item.thumbnailUpdateTime && item.thumbnailUpdateTime !== "") {
      setTimeout(() => {
        getEntityDetailsByID(portal, authToken, item.entityID).then(
          (entityDetails) => {
            if (entityDetails) {
              let avatarImg = entityDetails.thumbnailPhoto;

              if (
                avatarImg !== "" &&
                document.querySelector("#avatar_" + item.entityID)
              ) {
                document.querySelector("#avatar_" + item.entityID).innerHTML =
                  '<img src="data:image/png;base64,' +
                  avatarImg +
                  '" alt="' +
                  item.mame +
                  '" />';
              }
            }
          }
        );
      }, 300);

      return (
        <div id={"avatar_" + item.entityID} className={"avatar " + item.type}>
          {item.type !== "legacy" &&
            getInitials(unsafeParseTextFromHTMLString(item.name))}
        </div>
      );
    } else {
      return (
        <div className={"avatar " + item.type}>
          {item.type !== "legacy" &&
            getInitials(unsafeParseTextFromHTMLString(item.name))}
        </div>
      );
    }
  };
  const showResults = () => {
    if (userResultValue.length === 0 && roomResultValue.length === 0) return;
    let searchResullt = [].concat(userResultValue, roomResultValue);
    const list = searchResullt.map((item, index) => (
      <div
        id={item.type + item.entityID}
        key={item.entityID}
        className="ui-contact ui-contact invite-people-search-item"
      >
        <div className="inner-container">
          <div aria-hidden="true" className="person-container">
            {getAvatar(item)}
            <div
              className={
                item.type === "member" && item.MemberStatus === "Online"
                  ? "status online"
                  : "status offline"
              }
            ></div>
          </div>
          <div className="details-container">
            <div
              role="option"
              aria-selected="false"
              tabIndex="0"
              aria-disabled={
                item.type === "member" && item.MemberStatus === "Online"
                  ? "false"
                  : "true"
              }
              className="details-column"
            >
              <div className="name">
                {unsafeParseTextFromHTMLString(item.name)}
              </div>
            </div>
            <div className="roster-container">
              {(item.type === "legacy" ||
                (item.type === "member" && item.MemberStatus === "Online")) && (
                <div className="button">
                  <a
                    role="button"
                    aria-label={getFormattedString(
                      t("CLICK_TO_INVITE_USER"),
                      unsafeParseTextFromHTMLString(item.name)
                    )}
                    href="#/"
                    data-id={item.entityID}
                    onClick={inviteButtonHandle}
                    className="invite-button"
                  >
                    {""}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ));
    return list;
  };

  return (
    <div
      className="invite-to-call-tab-content search-tab-content"
      {...test("INVITE_SEARCH_TAB")}
    >
      <div
        tabIndex="-1"
        className="invite-to-call-content-header search-header"
      >
        {t("SEARCH")}
      </div>
      <div className="invite-to-call-content-body">
        <div className="invite-content">
          <div className="invite-tab-header">
            <div id="searchbar_invite_people">
              <div
                className={`invite-phone-field ${
                  requestInprogress ? "in-progress" : ""
                }`}
              >
                <input
                  type="search"
                  name="searchInvitePeople"
                  className="search-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={t("SEARCH")}
                  spellCheck="false"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
          <div id="invite-results-container-header">
            <div tabIndex="0" aria-live="polite" className="result">
              <span className={progress ? "status none" : "status"}>
                {[].concat(userResultValue, roomResultValue).length}
              </span>
              <div
                className={
                  progress ? "progress status" : "progress status none"
                }
              ></div>{" "}
              {t("TOTAL_RESULTS")}
            </div>
          </div>
          <div id="invite-people-search-results">{showResults()}</div>
        </div>
      </div>
    </div>
  );
};

export default SerachTab;
