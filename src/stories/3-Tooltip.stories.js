import React from "react";
import { withKnobs, text, boolean } from "@storybook/addon-knobs";
import { Tooltip, Position, Classes } from "@blueprintjs/core";
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
  title: "Tooltip",
  component: Tooltip,
  decorators: [withKnobs, (storyFn) => <Center>{storyFn()}</Center>],
};

export const Text = () => (
  <Tooltip
    isOpen={boolean("isOpen", true)}
    content={text("Content", "Text tooltip")}
    popoverClassName="bp4-intent-text"
    position={Position.TOP}
  >
    <span>target</span>
  </Tooltip>
);

export const InCall = () => (
  <Tooltip
    isOpen={boolean("isOpen", true)}
    content={text("Content", "In call tooltip")}
    popoverClassName="bp4-intent-call"
    position={Position.TOP}
  >
    <span>target</span>
  </Tooltip>
);

export const InCallMenu = () => (
  <Tooltip
    isOpen={boolean("isOpen", true)}
    content={text("Content", "In call menu")}
    popoverClassName="bp4-intent-call-menu"
    position={Position.TOP}
  >
    <span>target</span>
  </Tooltip>
);

export const Danger = () => (
  <Tooltip
    isOpen={boolean("isOpen", true)}
    content={text("Content", "Error message")}
    popoverClassName={Classes.INTENT_DANGER}
    position={Position.TOP}
  >
    <span>target</span>
  </Tooltip>
);
