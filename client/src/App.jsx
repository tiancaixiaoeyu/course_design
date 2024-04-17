import { Canvas } from "@react-three/fiber";
import { ScrollControls, useProgress } from "@react-three/drei";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Experience } from "./components/Experience";
import { Loader } from "./components/Loader";
import {
  SocketManager,
  itemsAtom,
  roomIDAtom,
} from "./components/SocketManager";
import { UI } from "./components/UI";
import { Provider } from "react-redux";
import store from "./store";

function App() {
  const [roomID] = useAtom(roomIDAtom);          // 获取roomID的变化情况
  const { progress } = useProgress();           // 获取加载进度
  const [loaded, setLoaded] = useState(false); // 默认资源未加载
  const [items] = useAtom(itemsAtom);         // 家具

  useEffect(() => {
    if (progress === 100 && items) {
      setLoaded(true); // 确保当进度100突然回到0时，用户界面不要（UI）淡出。
    }
  }, [progress]);

  return (
    // Redux store 仅提供给你的 React 组件，需要自己触发创建socket对象
    <Provider store={store}>   
    <>
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
        {/* 加载完毕渲染UI */}
      </Canvas>
      <Loader loaded={loaded} />
      {loaded && <UI />}
    </>
    </Provider>
  );
}

export default App;
