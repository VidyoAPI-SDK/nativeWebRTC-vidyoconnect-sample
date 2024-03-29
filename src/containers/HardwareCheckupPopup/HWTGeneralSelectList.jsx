import React from "react";
import { Button, Classes, MenuItem } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import SelectList from "components/SelectList";
import { getFormattedString } from "utils/helpers";
import { useTranslation } from "react-i18next";

import "./HWTGeneralSelectList.scss";

const HWTGeneralSelectList = ({
  icon,
  title,
  disabled,
  items,
  customRenderItem,
  onItemSelect,
  noResultsText,
  selectedItemName,
  buttonProps,
  className,
  footer,
}) => {
  const { t } = useTranslation();
  const highlightTranslations = (text) => {
    const tokens = text.split(/<i>|<\/i>/);
    if (tokens[1]) {
      tokens[1] = <i key={text}>{tokens[1]}</i>;
    }
    return tokens;
  };

  const renderItem = (item, { index, handleClick }) => (
    <MenuItem
      tabIndex="0"
      aria-selected={item.selected ? "true" : "false"}
      role="option"
      className={item.selected && Classes.ACTIVE}
      onClick={handleClick}
      text={highlightTranslations(item.name)}
      key={index}
    />
  );

  return (
    <div className={`general-select-content ${className || ""}`}>
      <SelectList
        className={`bp5-select-list ${disabled ? "disabled" : ""}`}
        disabled={disabled}
        items={items}
        filterable={false}
        itemRenderer={customRenderItem || renderItem}
        onItemSelect={onItemSelect}
        popoverProps={{
          portalClassName: "hwt-general-select-portal",
          minimal: true,
          shouldReturnFocusOnClose: true,
          autoFocus: true,
          enforceFocus: true,
        }}
        noResults={<MenuItem disabled={true} text={noResultsText} />}
      >
        <div className="HWTSelect-outter-cointainer">
          <img src={icon} alt={t("SELECTOR")}></img>
          <div className="HWTSelect-inner-cointainer">
            <span className="HWTSelect-title">{title}</span>
            <Button
              text={selectedItemName}
              aria-label={getFormattedString(
                t("SELECTOR_ARIA_TEXT"),
                title,
                selectedItemName
              )}
              aria-haspopup="true"
              rightIcon={IconNames.CHEVRON_DOWN}
              className={Classes.MINIMAL}
              {...buttonProps}
            />
          </div>
        </div>
      </SelectList>
    </div>
  );
};

export default HWTGeneralSelectList;
