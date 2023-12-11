import React from "react";
import { Button, Classes, MenuItem } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import SelectList from "components/SelectList";
import { getFormattedString } from "utils/helpers";
import { useTranslation } from "react-i18next";
import "./GeneralSelectList.scss";

const GeneralSelectList = ({
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
  matchTargetWidth = false,
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
        icon={
          icon ? (
            <img aria-hidden src={icon} width={18} height={18} alt="icon" />
          ) : (
            ""
          )
        }
        disabled={disabled}
        name={title}
        items={items}
        filterable={false}
        itemRenderer={customRenderItem || renderItem}
        onItemSelect={onItemSelect}
        matchTargetWidth={matchTargetWidth}
        popoverProps={{
          portalClassName: "general-select-portal",
          minimal: true,
          shouldReturnFocusOnClose: true,
          autoFocus: true,
          enforceFocus: true,
          onOpened: () => document.querySelector(".bp5-menu-item")?.focus(),
        }}
        noResults={<MenuItem disabled={true} text={noResultsText} />}
      >
        <Button
          aria-haspopup="menu"
          aria-label={getFormattedString(
            t("SELECTOR_ARIA_TEXT"),
            title,
            selectedItemName
          )}
          text={selectedItemName}
          rightIcon={IconNames.CARET_DOWN}
          className={Classes.MINIMAL}
          {...buttonProps}
        />
      </SelectList>
      <div className="general-select-footer">{footer}</div>
    </div>
  );
};

export default GeneralSelectList;
