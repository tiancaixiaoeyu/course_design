import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./components/Room";
import store from "./store";
import UserRoleContext from './components/UserRoleContext';
import { Provider as JotaiProvider } from 'jotai';
import { Provider as ReduxProvider } from 'react-redux';

function App() {
  return (
    <JotaiProvider>
      <ReduxProvider store={store}>
        <UserRoleContext>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/room/:roomId" element={<Room />} />
            </Routes>
          </BrowserRouter>
        </UserRoleContext>
      </ReduxProvider>
    </JotaiProvider>
  );
}

export default App;
