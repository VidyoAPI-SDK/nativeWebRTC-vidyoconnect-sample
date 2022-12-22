import React from "react";
import { Button, Classes, MenuItem } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import SelectList from "components/SelectList";
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
}) => {
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
        className={`bp4-select-list ${disabled ? "disabled" : ""}`}
        icon={<img src={icon} width={18} height={18} alt="icon" />}
        disabled={disabled}
        name={title}
        items={items}
        filterable={false}
        itemRenderer={customRenderItem || renderItem}
        onItemSelect={onItemSelect}
        popoverProps={{
          portalClassName: "general-select-portal",
          minimal: true,
        }}
        noResults={<MenuItem disabled={true} text={noResultsText} />}
      >
        <Button
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
