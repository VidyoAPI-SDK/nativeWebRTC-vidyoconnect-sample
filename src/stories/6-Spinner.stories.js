import React from "react";
import { withKnobs, number } from "@storybook/addon-knobs";
import { Spinner as BlueprintSpinner, Intent } from "@blueprintjs/core";
import Spinner from "../components/Spinner";
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
  title: "Spinner",
  component: Spinner,
  decorators: [withKnobs, (storyFn) => <Center>{storyFn()}</Center>],
};

export const Loader = () => (
  <Spinner
    width={number("Size", BlueprintSpinner.SIZE_STANDARD)}
    height={number("Size", BlueprintSpinner.SIZE_STANDARD)}
  />
);

export const Bubbles = () => (
  <div style={{ padding: "50px 80px", background: "#0D6EBD" }}>
    <Spinner
      bubbles={true}
      width={number("Size", BlueprintSpinner.SIZE_STANDARD)}
      height={number("Size", BlueprintSpinner.SIZE_STANDARD)}
    />
  </div>
);

export const BlueprintWhite = () => (
  <div style={{ padding: "50px 80px", background: "#0D6EBD" }}>
    <BlueprintSpinner
      size={number("Size", BlueprintSpinner.SIZE_STANDARD)}
      className={"bp4-intent-white"}
    />
  </div>
);

export const BlueprintPrimary = () => (
  <BlueprintSpinner
    size={number("Size", BlueprintSpinner.SIZE_STANDARD)}
    intent={Intent.PRIMARY}
  />
);

export const BlueprintSuccess = () => (
  <BlueprintSpinner
    size={number("Size", Spinner.SIZE_STANDARD)}
    intent={Intent.SUCCESS}
  />
);
