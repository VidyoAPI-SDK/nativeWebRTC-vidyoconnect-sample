import React, { useCallback, useEffect, useState } from "react";
import { addLogCategory } from "../../actions/creators";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Classes } from "@blueprintjs/core";
import "./LogLevels.scss";

const LogLevels = () => {
  const { logLevels, logCategories, activeLogs } = useSelector(
    (state) => state.vc_advancedConfig
  );
  const [areAllSelected, setAllSelected] = useState(false);
  const [activeTable, setActiveTable] = useState({});
  const dispatch = useDispatch();

  const getOperator = useCallback((checked) => {
    return checked ? "" : "-";
  }, []);

  useEffect(() => {
    let areAllSelected = true;
    const activeLogCategories = {};
    for (let logCategory of logCategories) {
      activeLogCategories[logCategory] = {};
      for (let logLevel in logLevels) {
        activeLogCategories[logCategory][logLevel] = false;
      }
    }
    for (let logCategory in activeLogs) {
      for (let logLevel in activeLogCategories[logCategory]) {
        if (activeLogs[logCategory] & logLevels[logLevel]) {
          activeLogCategories[logCategory][logLevel] = true;
        } else {
          areAllSelected = false;
        }
      }
    }
    setAllSelected(areAllSelected);
    setActiveTable(activeLogCategories);
  }, [activeLogs, logCategories, logLevels]);

  return (
    <div className="log-levels-popup">
      <table>
        <tbody>
          <tr>
            <th className="row-start">
              <Checkbox
                className={Classes.INTENT_PRIMARY}
                checked={areAllSelected}
                label={"Enable all"}
                onChange={(event) => {
                  dispatch(
                    addLogCategory(`${getOperator(event.target.checked)}all@*`)
                  );
                }}
              />
            </th>
            {Object.keys(logLevels).map((logLevel) => (
              <th key={`logLevels_${logLevel}_check`}>
                <Checkbox
                  className={Classes.INTENT_PRIMARY}
                  checked={Object.values(activeTable).every(
                    (logLevels) => logLevels[logLevel]
                  )}
                  onChange={(event) => {
                    dispatch(
                      addLogCategory(
                        `${getOperator(event.target.checked)}${logLevel}@*`
                      )
                    );
                  }}
                />
              </th>
            ))}
          </tr>
          <tr>
            <th className="row-start"></th>
            {Object.keys(logLevels).map((logLevel) => (
              <th key={`logLevels_${logLevel}_name`}>
                <span className="log-level-title">{logLevel}</span>
              </th>
            ))}
          </tr>
          {Object.entries(activeTable).map(([logCategory, activeLogLevels]) => (
            <tr key={`logCategory_${logCategory}`}>
              <th className="row-start">
                <Checkbox
                  className={Classes.INTENT_PRIMARY}
                  label={logCategory}
                  checked={Object.values(activeLogLevels).every(
                    (enabled) => enabled
                  )}
                  onChange={(event) => {
                    dispatch(
                      addLogCategory(
                        `${getOperator(event.target.checked)}all@${logCategory}`
                      )
                    );
                  }}
                />
              </th>
              {Object.entries(activeLogLevels).map(([logLevel, enabled]) => (
                <th key={`${logCategory}_${logLevel}_check`}>
                  <Checkbox
                    className={Classes.INTENT_PRIMARY}
                    checked={enabled}
                    onChange={(event) => {
                      dispatch(
                        addLogCategory(
                          `${getOperator(
                            event.target.checked
                          )}${logLevel}@${logCategory}`
                        )
                      );
                    }}
                  />
                </th>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogLevels;
