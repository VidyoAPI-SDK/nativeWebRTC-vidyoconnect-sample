import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

const Portal = ({ children, target }) => {
  const container = useMemo(() => document.createElement("div"), []);

  useEffect(() => {
    target.appendChild(container);

    return () => {
      target.removeChild(container);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ReactDOM.createPortal(children, container);
};

export default Portal;
