import React from "react";
import { action } from "@storybook/addon-actions";
import { withKnobs, number, boolean, text } from "@storybook/addon-knobs";
import { InputGroup } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
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
  title: "Input",
  component: InputGroup,
  decorators: [withKnobs, (storyFn) => <Center>{storyFn()}</Center>],
};

export const SelectMenu = () => (
  <InputGroup
    small={boolean("Small", false)}
    large={boolean("Large", false)}
    round={boolean("Round", false)}
    leftIcon={
      boolean("Show icon", false) && text("Icon name", IconNames.SEARCH)
    }
    disabled={boolean("Disabled", false)}
    style={{ width: number("Width", 240) }}
    placeholder={text("Placeholder", "Enter value")}
    onChange={action("changed")}
  />
);
