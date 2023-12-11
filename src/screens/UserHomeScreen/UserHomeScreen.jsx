import React, { useState, useEffect } from "react";
import "./UserHomeScreen.scss";
import { myAccountRequest } from "../../services/SoapAPIProvider/soapAPIRequests/myAccount";
import storage from "utils/storage";

const UserHomeScreen = () => {
  const [response, setResponse] = useState("Loading...");

  useEffect(
    () => {
      try {
        const { portal, authToken } = storage.getItem("user");
        myAccountRequest(portal, authToken)
          .then((user) => {
            setResponse(JSON.stringify(user, null, 2));
          })
          .catch((e) => {
            setResponse(JSON.stringify(e, null, 2));
          });
      } catch (e) {
        setResponse("Invalid token");
      }
    },
    // eslint-disable-next-line
    [
      /* on mount only */
    ]
  );

  return (
    <div className="user-screen user-home-screen">
      <div className="content">
        <h2>Logged in user</h2>
        <pre className="bp5-code-block">
          <code>{response}</code>
        </pre>
      </div>
    </div>
  );
};

export default UserHomeScreen;
