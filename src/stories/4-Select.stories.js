import React from "react";
import { action } from "@storybook/addon-actions";
import { withKnobs, boolean } from "@storybook/addon-knobs";
import { Button, MenuItem, Classes } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import "../styles/blueprint.scss";

const styles = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  position: "absolute",
  alignItems: "center",
  justifyContent: "center",
};

const Center = ({ children }) => <div style={styles}>{children}</div>;

export default {
  title: "Select",
  component: Select,
  decorators: [withKnobs, (storyFn) => <Center>{storyFn()}</Center>],
};

const items = [
  { name: "Select Menu Item 1", selected: true },
  { name: "Select Menu Item 2" },
  { name: "Select Menu Item 3" },
];

const renderItem = (item, { index, handleClick }) => (
  <MenuItem
    className={item.selected && Classes.ACTIVE}
    onClick={handleClick}
    text={item.name}
    key={index}
  />
);

export const SelectMenu = () => (
  <Select
    items={items}
    itemRenderer={renderItem}
    className={"bp4-select-list"}
    onItemSelect={action("select")}
    disabled={boolean("Disabled", false)}
    filterable={boolean("Filterable", false)}
    noResults={<MenuItem disabled={true} text="No results" />}
    popoverProps={{
      portalClassName: "bp4-select-list-portal",
      minimal: boolean("Minimal", true),
    }}
  >
    <Button
      text={items.find((item) => item.selected).name}
      rightIcon={IconNames.CARET_DOWN}
      className={Classes.MINIMAL}
      style={{ width: 190 }}
    />
  </Select>
);

export const NoResults = () => (
  <Select
    items={[]}
    className={"bp4-select-list"}
    disabled={boolean("Disabled", false)}
    filterable={boolean("Filterable", false)}
    noResults={<MenuItem disabled={true} text="No results" />}
    popoverProps={{
      portalClassName: "bp4-select-list-portal",
      minimal: boolean("Minimal", true),
    }}
  >
    <Button
      rightIcon={IconNames.CARET_DOWN}
      className={Classes.MINIMAL}
      style={{ width: 190 }}
      text="No results"
    />
  </Select>
);
