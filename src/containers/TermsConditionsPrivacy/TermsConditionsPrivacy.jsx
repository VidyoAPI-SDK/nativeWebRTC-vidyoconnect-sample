import React, { useEffect, useState, useCallback } from "react";
import data from "./tc.json";
import { Label } from "@blueprintjs/core";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { tcData } from "utils/constants";

const TermsConditionsPrivacy = (props) => {
  const [jsonData, setJsonData] = useState({});
  const [links, setLinks] = useState({});
  const [userAgreement, setUserAgreement] = useState(false);
  const [termsConditionBlock, showTermsConditionBlock] = useState(false);
  let location = useLocation();
  let portal = location.state.host;
  let time = Date.now();

  const getCloudRootPortal = (supportedList) => {
    let result = "";
    let wildCards = Object.keys(supportedList);

    wildCards
      .sort((a, b) => {
        return b.length - a.length;
      })
      .some((wildCard) => {
        let regexp = new RegExp(`.${wildCard}`, "i");
        let isMatched = portal.match(regexp);

        if (isMatched) {
          result = supportedList[wildCard];
        }

        return isMatched;
      });

    return result;
  };

  const getLocalJSON = () => {
    let supportedDomains = data.domains;
    let cloudRootPortal = getCloudRootPortal(supportedDomains);
    if (cloudRootPortal) {
      console.log(
        `Domain ${portal} is supported , cloud is ${cloudRootPortal}`
      );
      return data;
    } else {
      console.log(`Domain ${portal} is not supported`);
      return {};
    }
  };

  const initGuest = () => {
    if (jsonData) {
      let links = parseJSON();
      let isVersionCorrect = isVersionDataCorrect(links, jsonData.version);
      if (isVersionCorrect) {
        setUserAgreement(true);
      } else {
        console.log(
          "JSON is incorrect or portal is not supported: do not show T&C UI."
        );
      }
    }
  };

  const { t } = useTranslation();

  const getTermsAndPrivacyLinks = () => {
    let terms = links[tcData.TERMS_JSON_NAME];
    let privacy = links[tcData.PRIVACY_JSON_NAME];
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: t("TC_PP_GUEST", {
            terms,
            privacy,
          }),
        }}
      ></span>
    );
  };

  const isVersionDataCorrect = (links, version) => {
    if (
      !links ||
      !links[tcData.TERMS_JSON_NAME] ||
      !links[tcData.PRIVACY_JSON_NAME] ||
      !version
    ) {
      return false;
    }
    return true;
  };

  const parseJSON = useCallback(() => {
    let links = {};
    (jsonData.links || []).forEach((item) => {
      if (
        item.name === tcData.PRIVACY_JSON_NAME ||
        item.name === tcData.TERMS_JSON_NAME
      ) {
        links[item.name] = item.link;
      }
    });
    setLinks(links);
    return links;
  }, [jsonData]);

  const toggleTermsConditionBlock = (json) => {
    if (Object.keys(json).length) {
      showTermsConditionBlock(true);
    } else {
      showTermsConditionBlock(false);
      setUserAgreement(true);
    }
    props.checkCloudPortalCallback();
  };

  const list = useCallback(async () => {
    return await axios({
      method: "get",
      url: `${tcData.LINK_URL}/${tcData.TENANT_JSON_NAME}?${time}`,
      timeout: tcData.SERVER_TIMEOUT,
    });
  }, [time]);

  const getJsonData = useCallback(
    async (cloudPortal) => {
      return axios({
        method: "get",
        url: `${tcData.LINK_URL}/${cloudPortal}/${tcData.LINK_JSON_NAME}?${time}`,
        timeout: tcData.SERVER_TIMEOUT,
      });
    },
    [time]
  );

  const acceptedTC = useCallback((value) => {
    props.acceptedTC(value);
  }, [props]);

  const setJson = function () {
    list()
      .then((result) => {
        let cloudRootPortal = getCloudRootPortal(result.data);
        if (cloudRootPortal) {
          return getJsonData(cloudRootPortal);
        } else {
          return new Promise((resolve, reject) => {
            let json = { data: getLocalJSON() };
            resolve(json);
          });
        }
      })
      .then((result) => {
        setJsonData(result.data);
        toggleTermsConditionBlock(result.data);
      })
      .catch((error) => {
        console.log(`Latest T&C JSON is not received from web server.`);
        let json = getLocalJSON();
        setJsonData(json);
        toggleTermsConditionBlock(json);
      });
  };

  // eslint-disable-next-line
  useEffect(setJson, []);

  useEffect(initGuest, [jsonData, parseJSON]);

  const checkTCAccept = function () {
    acceptedTC(userAgreement);
  };

  useEffect(checkTCAccept, [userAgreement, acceptedTC]);

  return (
    <div className="terms-and-privacy">
      {termsConditionBlock && <Label>{getTermsAndPrivacyLinks()}</Label>}
    </div>
  );
};

export default TermsConditionsPrivacy;
