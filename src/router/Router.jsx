import React from "react";

import { Route, MemoryRouter, Routes } from "react-router-dom";

import InitialScreen from "screens/InitialScreen";
import GuestInitialScreen from "screens/GuestInitialScreen";
import GuestBeautyScreen from "screens/GuestBeautyScreen";
import GuestAccessCodeScreen from "screens/GuestAccessCodeScreen";
import JoiningCallScreen from "screens/JoiningCallScreen";
import LeavingCallScreen from "screens/LeavingCallScreen";
import GuestInCall from "screens/GuestInCall";
import GuestPostCall from "screens/GuestPostCall";
import BrowserCheckScreen from "screens/BrowserCheckScreen";
import UserHomeScreen from "screens/UserHomeScreen";

import GlobalMessages from "containers/GlobalMessages";
import { VidyoConnector } from "features";

class RouterComponent extends React.Component {
  render() {
    return (
      <MemoryRouter>
        <Routes>
          <Route path="/InitialScreen" element={<InitialScreen/>} />
          <Route path="/GuestInitialScreen" element={<GuestInitialScreen/>} />
          <Route path="/GuestBeautyScreen" element={<GuestBeautyScreen/>} />
          <Route
            path="/GuestAccessCodeScreen"
            element={<GuestAccessCodeScreen/>}
          />
          <Route path="/JoiningCallScreen" element={<JoiningCallScreen/>} />
          <Route path="/LeavingCallScreen" element={<LeavingCallScreen/>} />
          <Route path="/GuestInCall" element={<GuestInCall/>} />
          <Route path="/GuestPostCall" element={<GuestPostCall/>} />
          <Route path="/BrowserCheckScreen" element={<BrowserCheckScreen/>} />
          <Route path="/UserHomeScreen" element={<UserHomeScreen/>} />
          <Route index element={<BrowserCheckScreen/>} />
        </Routes>
        <VidyoConnector.GlobalMessages />
        <GlobalMessages />
      </MemoryRouter>
    );
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    //console.error(error, errorInfo);
  }
}

export default RouterComponent;
