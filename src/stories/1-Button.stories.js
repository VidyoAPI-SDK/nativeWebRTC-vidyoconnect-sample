import React from "react";
import { action } from "@storybook/addon-actions";
import { withKnobs, text, boolean } from "@storybook/addon-knobs";
import { Button, Classes } from "@blueprintjs/core";
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
  background: "radial-gradient(#4C97D9, #0D6EBD)",
};

const Center = ({ children }) => <div style={styles}>{children}</div>;

export default {
  title: "Button",
  component: Button,
  decorators: [withKnobs, (storyFn) => <Center>{storyFn()}</Center>],
};

export const Primary = () => (
  <Button
    fill={boolean("Fill", false)}
    small={boolean("Small", false)}
    large={boolean("Large", false)}
    disabled={boolean("Disabled", false)}
    className={Classes.INTENT_PRIMARY}
    onClick={action("clicked")}
  >
    {text("Label", "Primary")}
  </Button>
);

export const Secondary = () => (
  <Button
    fill={boolean("Fill", false)}
    small={boolean("Small", false)}
    large={boolean("Large", false)}
    disabled={boolean("Disabled", false)}
    className="bp4-intent-secondary"
    onClick={action("clicked")}
  >
    {text("Label", "Secondary")}
  </Button>
);

export const Success = () => (
  <Button
    fill={boolean("Fill", false)}
    small={boolean("Small", false)}
    large={boolean("Large", false)}
    disabled={boolean("Disabled", false)}
    className={Classes.INTENT_SUCCESS}
    onClick={action("clicked")}
  >
    {text("Label", "Success")}
  </Button>
);

export const Danger = () => (
  <Button
    fill={boolean("Fill", false)}
    small={boolean("Small", false)}
    large={boolean("Large", false)}
    disabled={boolean("Disabled", false)}
    className={Classes.INTENT_DANGER}
    onClick={action("clicked")}
  >
    {text("Label", "Danger")}
  </Button>
);

export const Share = () => (
  <div style={{ padding: "40px 50px", background: "#fff" }}>
    <Button
      fill={boolean("Fill", false)}
      small={boolean("Small", false)}
      large={boolean("Large", false)}
      disabled={boolean("Disabled", false)}
      className="bp4-intent-share"
      onClick={action("clicked")}
    >
      {text("Label", "Share")}
    </Button>
  </div>
);
