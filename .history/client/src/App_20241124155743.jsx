import { Canvas } from "@react-three/fiber";
import { ScrollControls, useProgress } from "@react-three/drei";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Experience } from "./components/Experience";
import { Loader } from "./components/Loader";
import { createRoot } from "react-dom/client"; //使用 createRoot 替代 ReactDOM.render的前面导入
import {
  SocketManager,
  itemsAtom,
  roomIDAtom,
} from "./components/SocketManager";
import { UI } from "./components/UI";
import { Provider } from "react-redux";
import store from "./store";
import UserRoleContext from "./components/UserRoleContext";
import { userNameAtom } from "./components/SocketManager";
import { userName } from "./components/SocketManager";
function App() {
  const [userRole] = useAtom(userRoleAtom); // 可以从服务器获取或通过其他方式动态获取
  const [userName] = useAtom(userNameAtom);
  const [roomID] = useAtom(roomIDAtom); // 获取roomID的变化情况
  const { progress } = useProgress(); // 获取加载进度
  const [loaded, setLoaded] = useState(false); // 默认资源未加载
  const [items] = useAtom(itemsAtom); // 家具

  useEffect(() => {
    if (progress === 100 && items) {
      setLoaded(true); // 确保当进度100突然回到0时，用户界面不要（UI）淡出。
    }
  }, [progress, items]);

  return (
    <Provider store={store}>
      <UserRoleContext.Provider value={{ userRole, userName }}>
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
      </UserRoleContext.Provider>
    </Provider>
  );
}

export default App;
import React from "react";
//import ReactDOM from 'react-dom';
// import App from './App';
// import UserRoleProvider from 'C:/Users/DELL/course_design/client/src/components/UserRoleProvider.js'
import UserRoleProvider from "./components/UserRoleProvider";

function Root() {
  return (
    <UserRoleProvider>
      <App />
    </UserRoleProvider>
  );
}

//ReactDOM.render(<Root />, document.getElementById('root'));
//说是被弃用了马上， ai改成下面三行
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Root />);

//const express = require('express');//说是在客户端下不需要导入express

// // 改成ES6
// // import express from 'express';
// // const cors = require('cors');
//  const app = express();

//但是这样app就没有声明，所以先注释掉

// // 允许所有域名访问
// app.use(cors());

// //或者，你可以只允许特定的域名访问
// app.use(cors({
//   origin: 'http://localhost:5174' // 替换为你的前端应用程序域名和端口
// }));

// // 你的路由和逻辑代码...

// app.listen(3000, () => {
//   console.log('Server on port 3000');
// });
// //import express from 'express';
// const cors = require('cors');
// //const app = express();

// // 允许来自 http://localhost:5174 的请求
// app.use(cors({ origin: 'http://localhost:5174' }));

// // 其他可能的中间件，比如解析请求体的中间件
// app.use(express.json()); // 用于解析JSON格式的请求体
// app.use(express.urlencoded({ extended: true })); // 用于解析URL编码的请求体

// // 配置路由
// app.get('/', (req, res) => {
//   res.send('Hello, World!');
// });

// // 更多的路由配置...
// app.get('/some-endpoint', (req, res) => {
//   // 处理该路由的逻辑
//   res.send('Some endpoint');
// });

// // 启动服务器
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
