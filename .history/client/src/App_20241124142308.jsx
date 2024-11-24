import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./components/Room";
import UserRoleContext from './components/UserRoleContext';
import { Provider } from 'jotai';

function App() {
  return (
    <Provider>
      <UserRoleContext>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </BrowserRouter>
      </UserRoleContext>
    </Provider>
  );
}

export default App;
