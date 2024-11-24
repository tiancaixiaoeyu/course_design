import React from 'react';
import { Canvas } from "@react-three/fiber";
import { ScrollControls, useProgress } from "@react-three/drei";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Experience } from "./components/Experience";
import { Loader } from "./components/Loader";
import { createRoot } from "react-dom/client";
import {
  SocketManager,
  itemsAtom,
  roomIDAtom,
} from "./components/SocketManager";
import { UI } from "./components/UI";
import { Provider as ReduxProvider } from "react-redux";
import store from "./store";
import { Provider as JotaiProvider } from 'jotai';
import { userNameAtom, userRoleAtom } from "./store/atoms";  

function App() {
  const [userRole] = useAtom(userRoleAtom);
  const [userName] = useAtom(userNameAtom);
  const [roomID] = useAtom(roomIDAtom);
  const { progress } = useProgress();
  const [loaded, setLoaded] = useState(false);
  const [items] = useAtom(itemsAtom);

  useEffect(() => {
    if (progress === 100 && items) {
      setLoaded(true);
    }
  }, [progress, items]);

  return (
    <JotaiProvider>
      <ReduxProvider store={store}>
        <SocketManager />
        <Canvas
          shadows
          camera={{
            position: [0, 8, 2],
            fov: 30,
          }}
        >
          <color attach="background" args={["#ffffff"]} />
          <ScrollControls pages={roomID ? 4 : 0}>
            <Experience loaded={loaded} />
          </ScrollControls>
        </Canvas>
        <Loader loaded={loaded} />
        {loaded && <UI />}
      </ReduxProvider>
    </JotaiProvider>
  );
}

export default App;
