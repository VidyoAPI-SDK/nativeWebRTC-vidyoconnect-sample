import React from "react";
import { action } from "@storybook/addon-actions";
import { withKnobs, text, boolean } from "@storybook/addon-knobs";
import { Checkbox, Classes } from "@blueprintjs/core";
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
  title: "Checkbox",
  component: Checkbox,
  decorators: [withKnobs, (storyFn) => <Center>{storyFn()}</Center>],
};

export const Primary = () => (
  <div style={{ padding: "30px 50px", background: "#fff" }}>
    <Checkbox
      className={Classes.INTENT_PRIMARY}
      disabled={boolean("Disabled", false)}
      label={text("Label", "Primary")}
      onChange={action("changed")}
    />
  </div>
);

export const Success = () => (
  <div style={{ padding: "30px 50px", background: "#fff" }}>
    <Checkbox
      className={Classes.INTENT_SUCCESS}
      disabled={boolean("Disabled", false)}
      label={text("Label", "Success")}
      onChange={action("changed")}
    />
  </div>
);

export const White = () => (
  <Checkbox
    className="bp4-intent-white"
    disabled={boolean("Disabled", false)}
    label={text("Label", "White")}
    onChange={action("changed")}
  />
);
