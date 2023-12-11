import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TabSwitcher from "components/TabSwitcher";
import SearchTab from "./Tabs/SearchTab";
import DevicesTab from "./Tabs/DevicesTab";
import CallTab from "./Tabs/CallTab";
import SMSTab from "./Tabs/SMSTab";
import EmailTab from "./Tabs/EmailTab";
import LinkTab from "./Tabs/LinkTab";
import { useMediaQuery } from "react-responsive";
import {
  useMobileDimension,
  useModerationStatuses,
  useOrientation,
} from "utils/hooks";
import { test } from "utils/helpers";
import SearchTabIcon from "assets/images/buttons/invite_search_inactive.svg";
import DevicesTabIcon from "assets/images/buttons/invite_call_inactive.svg";
import CallTabIcon from "assets/images/buttons/invite_callout_inactive.svg";
import SMSTabIcon from "assets/images/buttons/invite_sms_inactive.svg";
import EmailTabIcon from "assets/images/buttons/invite_email_inactive.svg";
import LinkTabIcon from "assets/images/buttons/invite_link_inactive.svg";
import ActiveSearchTabIcon from "assets/images/buttons/invite_search_active.svg";
import ActiveDevicesTabIcon from "assets/images/buttons/invite_call_active.svg";
import ActiveCallTabIcon from "assets/images/buttons/invite_callout_active.svg";
import ActiveSMSTabIcon from "assets/images/buttons/invite_sms_active.svg";
import ActiveEmailTabIcon from "assets/images/buttons/invite_email_active.svg";
import ActiveLinkTabIcon from "assets/images/buttons/invite_link_active.svg";
import LandScapeModePopup from "components/LandScapeModePopup/LandScapeModePopup";
import { trapFocusInElement } from "utils/accessability";

import "./Popup.scss";

const InviteToCallPopup = ({
  onClose,
  userIsRegistered,
  customParameters,
  gcpServices,
}) => {
  const { t } = useTranslation();
  const [isMobileDimension] = useMobileDimension();
  const { isUserRoomOwner, isBecomeModerator } = useModerationStatuses();
  const isNarrowScreen = useMediaQuery({ maxWidth: 690 });
  const [orientation] = useOrientation();

  const isMobileClass = isMobileDimension || isNarrowScreen;

  const isLinkTabEnabled = userIsRegistered;
  const smsTabEnabled =
    userIsRegistered &&
    customParameters?.smsServiceEnabled === "1" &&
    gcpServices?.sendSMS?.isServiceAvailable;
  // TODO in the next variables isBecomeModerator should be changed to userIsAdmin,
  // Need to check if it works after VPTL-13343 will be fixed
  const callOutTabEnabled =
    userIsRegistered &&
    customParameters?.callOutServiceEnabled === "1" &&
    (isUserRoomOwner || isBecomeModerator);
  const devicesTabEnabled = isUserRoomOwner || isBecomeModerator;
  const searchTabEnabled = isUserRoomOwner || isBecomeModerator;
  let tabs = [
    {
      label: t("SEARCH"),
      icon: SearchTabIcon,
      activeIcon: ActiveSearchTabIcon,
      id: "SearchTabIcon",
      content: <SearchTab closeModal={onClose} />,
      hidden: !searchTabEnabled,
    },
    {
      label: t("DEVICES"),
      icon: DevicesTabIcon,
      activeIcon: ActiveDevicesTabIcon,
      id: "devicesTab",
      content: <DevicesTab closeModal={onClose} />,
      hidden: !devicesTabEnabled,
    },
    {
      label: t("CALL"),
      icon: CallTabIcon,
      activeIcon: ActiveCallTabIcon,
      id: "callTab",
      content: <CallTab closeModal={onClose} />,
      hidden: !callOutTabEnabled,
    },
    {
      label: t("SMS"),
      icon: SMSTabIcon,
      activeIcon: ActiveSMSTabIcon,
      id: "smsTab",
      content: <SMSTab closeModal={onClose} />,
      hidden: !smsTabEnabled,
    },
    {
      label: t("EMAIL"),
      icon: EmailTabIcon,
      activeIcon: ActiveEmailTabIcon,
      id: "emailTab",
      content: <EmailTab />,
      hidden: true,
    },
    {
      label: t("LINK"),
      icon: LinkTabIcon,
      activeIcon: ActiveLinkTabIcon,
      id: "linkTab",
      content: <LinkTab />,
      hidden: !isLinkTabEnabled,
    },
  ];

  tabs = tabs.filter((tab) => {
    return !tab.hidden;
  });

  if (isMobileDimension) {
    tabs = tabs.filter((tab) => {
      return !tab.hideInMobileView;
    });
  }

  const [activeTab, setActiveTab] = useState(tabs[0]);

  const changeTab = (tabId) => {
    setActiveTab(
      tabs.filter((tab) => {
        return tab.id === tabId;
      })[0]
    );
  };

  useEffect(() => {
    setActiveTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const elementSelectorToBeFocused =
      activeTab.id === "linkTab"
        ? "#copy-link-btn"
        : ".invite-to-call-content-header";
    const removeTrap = trapFocusInElement({
      elementId: "#invite-to-call-popup",
      elementSelectorToBeFocused,
      liveUpdateOfElementList: true,
      hideContentBeyondModal: true,
    });
    return removeTrap;
  }, [activeTab]);

  if (isMobileDimension && orientation === "landscape") {
    return (
      <LandScapeModePopup title={t("INVITE_NOT_WORK_IN_LANDSCAPE_SCREEN")} />
    );
  }

  return (
    <div
      id="invite-to-call-popup"
      aria-modal="true"
      className={`invite-to-call-content ${isMobileClass ? "mobile" : ""}`}
      {...test("INVITE_TO_CALL_POPUP")}
    >
      <div className="invite-to-call-header">
        {t("INVITE_PARTICIPANT_TO_CALL")}
        <div className="invite-to-call-close">
          <button
            aria-label={t("CLOSE_POPUP")}
            onClick={onClose}
            {...test("INVITE_TO_CALL_POPUP_CLOSE_BUTTON")}
          ></button>
        </div>
      </div>
      <TabSwitcher
        activeTabId={activeTab.id}
        changeTab={changeTab}
        tabs={tabs}
        bottom={isMobileClass}
      />
    </div>
  );
};

export default InviteToCallPopup;
