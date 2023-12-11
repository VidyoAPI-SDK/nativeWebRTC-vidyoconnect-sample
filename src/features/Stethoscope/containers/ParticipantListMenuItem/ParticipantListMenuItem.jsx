import React from "react";
import { test } from "utils/helpers";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import CheckedWhiteSVG from "assets/images/buttons/checked-white.svg";
import {
  selectRemoteStethoscope,
  unselectRemoteStethoscope,
} from "../../actions/creators";
import "./ParticipantListMenuItem.scss";

const ParticipantListMenuItem = ({ participant }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { remoteStethoscopes, selectedRemoteStethoscope } = useSelector(
    (state) => state.feature_stethoscope
  );
  const stethoscope = remoteStethoscopes.find(
    (stethoscope) => stethoscope.participant.id === participant.id
  );

  if (!stethoscope) {
    return null;
  }

  return (
    <li
      className="participant-nav__list-item"
      onClick={() => {
        if (selectedRemoteStethoscope?.id === stethoscope.id) {
          dispatch(unselectRemoteStethoscope());
        } else {
          dispatch(selectRemoteStethoscope(stethoscope));
        }
      }}
      {...test("STETHOSCOPE")}
    >
      <span className="participant-nav__icon participant-nav__icon--stethoscope"></span>
      <span className="participant-nav__title">{t("STETHOSCOPE")}</span>
      {selectedRemoteStethoscope?.participant.id === participant.id && (
        <img alt={t("CHECKED")} src={CheckedWhiteSVG} height={24} />
      )}
    </li>
  );
};

export default ParticipantListMenuItem;
