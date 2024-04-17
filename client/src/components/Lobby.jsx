import {
  AccumulativeShadows,
  Html,
  RandomizedLight,
  Text3D,
  useFont,
} from "@react-three/drei";
import { motion } from "framer-motion-3d";
import { useAtom } from "jotai";
import { Suspense, useMemo, useRef } from "react";
import { LobbyAvatar } from "./LobbyAvatar";
import { Big_building } from "./Big_building";
import { mapAtom, roomIDAtom, roomsAtom } from "./SocketManager";
import { Tablet } from "./Tablet";
import { avatarUrlAtom } from "./UI";

import { useSelector } from "react-redux";

let firstLoad = true;

export const Lobby = () => {
  const [rooms] = useAtom(roomsAtom);
  const [avatarUrl] = useAtom(avatarUrlAtom);
  const [_roomID, setRoomID] = useAtom(roomIDAtom);
  const [_map, setMap] = useAtom(mapAtom);

  // 使用useSelector从Redux store中获取socket
  const socket = useSelector(state => state.socket)
 

  const joinRoom = (roomId) => {
    if (!socket) {
      console.error('Socket is not initialized.'); // 如果socket未初始化，则打印错误消息
      return;
    }
    // 使用从Redux store获取的socket进行其他操作
    socket.emit("joinRoom", roomId, {
      avatarUrl,
    });
    setMap(null); // 确保下次切换房间不保留上一房间的状态
    setRoomID(roomId);
  };

  const isMobile = window.innerWidth < 1024;// 窗口宽度<1024，检测是否是移动设备

  const tablet = useRef();

  const goldenRatio = Math.min(1, window.innerWidth / 1600);

  const accumulativeShadows = useMemo(  // 优化光影效果
    () => (
      <AccumulativeShadows
        temporal    
        frames={30}
        alphaTest={0.85}
        scale={50}  
        position={[0, 0, 0]}
        color="pink"
      >
        <RandomizedLight
          amount={4}
          radius={9}
          intensity={0.55}
          ambient={0.25}
          position={[5, 5, -20]}
        />
        <RandomizedLight
          amount={4}
          radius={5}
          intensity={0.25}
          ambient={0.55}
          position={[-5, 5, -20]}
        />
      </AccumulativeShadows>
    ),
    []
  );
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent); 

  return (
    <group position-y={-1.5}>
      <motion.group
        ref={tablet}
        scale={isMobile ? 0.18 : 0.22}
        position-x={isMobile ? 0 : -0.25 * goldenRatio}
        position-z={0.5}
        initial={{
          y: firstLoad ? 0.5 : 1.5,
          rotateY: isSafari ? 0 : isMobile ? 0 : Math.PI / 8, 
        }}
        animate={{
          y: isMobile ? 1.65 : 1.5,
        }}
        transition={{
          duration: 1,
          delay: 0.5,
        }}
        onAnimationComplete={() => {
          firstLoad = false;
        }}
      >
        <Tablet scale={0.03} rotation-x={Math.PI / 2} />
        <Html
          position={[0, 0.17, 0.11]}
          transform={!isSafari}
          center
          scale={0.121}
        >
          <div
            className={`${
              isSafari
                ? "w-[310px] h-[416px] lg:w-[390px] lg:h-[514px]"
                : "w-[390px] h-[514px]"
            }  max-w-full  overflow-y-auto p-5  place-items-center pointer-events-none select-none`}
          >
            <div className="w-full overflow-y-auto flex flex-col space-y-2">
              <h1 className="text-center text-white text-2xl font-bold">
                欢迎进入
                <br />
                  团元团宇
              </h1>
              <p className="text-center text-white">
                请选择一个场景加入
              </p>
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-4 rounded-lg bg-slate-800 bg-opacity-70 text-white hover:bg-slate-950 transition-colors cursor-pointer pointer-events-auto"
                  onClick={() => joinRoom(room.id)}
                >
                  <p className="text-uppercase font-bold text-lg">
                    {room.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        room.nbCharacters > 0 ? "bg-green-500" : "bg-orange-500"
                      }`}
                    ></div>
                    {room.nbCharacters} 人在该场景
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Html>
      </motion.group>
      <group position-z={-8} rotation-y={Math.PI / 6}>
        <Text3D
          font={"fonts/Inter_Bold.json"}
          position-z={1}
          size={0.3}
          position-x={-3}
          castShadow
          rotation-y={Math.PI / 8}
          bevelEnabled
          bevelThickness={0.005}
          letterSpacing={0.012}
        >
          Meta
          <meshStandardMaterial color="white" />
        </Text3D>

        <Text3D
          font={"fonts/Inter_Bold.json"}
          position-z={2.5}
          size={0.3}
          position-x={-3}
          castShadow
          rotation-y={Math.PI / 8}
          bevelEnabled
          bevelThickness={0.005}
          letterSpacing={0.012}
        >
          universe
          <meshStandardMaterial color="white" />
        </Text3D>
        {/* <Big_building scale={0.5} position-z={-1}/> */}
        {/* <Big_building scale={0.65} position-x={-3} position-z={-1.2} /> */}
        {/* <Big_building scale={0.8} position-x={3.3} position-z={-1.6} /> */}
      </group>
      {accumulativeShadows}
      <Suspense>
        <LobbyAvatar
          position-z={-1}
          position-x={0.5 * goldenRatio}
          position-y={isMobile ? -0.4 : 0}
          rotation-y={-Math.PI / 8}
        />
      </Suspense>
    </group>
  );
};

useFont.preload("/fonts/Inter_Bold.json");
