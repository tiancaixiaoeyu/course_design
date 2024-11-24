import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

//import {userRole} from './Avatar';
import { AvatarCreator } from "@readyplayerme/react-avatar-creator";
import { motion } from "framer-motion";
import { roomItemsAtom } from "./Room";
import { roomIDAtom } from "./SocketManager";
import { useSelector } from "react-redux";
export const buildModeAtom = atom(false);
export const shopModeAtom = atom(false);
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);
export const userRoleAtom = atom("student");
export const userNameAtom = atom("someone");

export const avatarUrlAtom = atom(
  localStorage.getItem("avatarURL") ||
    "https://models.readyplayer.me/64f0265b1db75f90dcfd9e2c.glb?meshlod=1&quality=medium"
);

// 输入密码
const PasswordInput = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const socket = useSelector((state) => state.socket);

  const checkPassword = () => {
    // 检查密码
    socket.emit("passwordCheck", password);
  };

  useEffect(() => {
    socket.on("passwordCheckSuccess", () => {
      // 密码准确
      onSuccess(); // 设置buildMode = true
      onClose(); // 关掉输入密码的界面
    });
    socket.on("passwordCheckFail", () => {
      // 密码错误
      setError("Wrong password");
    });
    return () => {
      socket.off("passwordCheckSuccess");
      socket.off("passwordCheckFail");
    };
  });

  return (
    <div className="fixed z-10 grid place-items-center w-full h-full top-0 left-0">
      <div
        className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      {/* 输入密码界面 */}
      <div className="bg-white rounded-lg shadow-lg p-4 z-10">
        <p className="text-lg font-bold">Password</p>
        <input
          autoFocus
          type="text"
          className="border rounded-lg p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* 确认密码 */}
        <div className="space-y-2 mt-2">
          <button
            className="bg-green-500 text-white rounded-lg px-4 py-2 flex-1 w-full"
            onClick={checkPassword}
          >
            Enter
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

{
  /* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg> */
}

export const UI = () => {
  const [userRole, setUserRole] = useAtom(userRoleAtom);
  const [userName, setUserName] = useAtom(userNameAtom);

  const socket = useSelector((state) => state.socket);
  const [buildMode, setBuildMode] = useAtom(buildModeAtom);
  const [shopMode, setShopMode] = useAtom(shopModeAtom);
  const [draggedItem, setDraggedItem] = useAtom(draggedItemAtom);
  const [draggedItemRotation, setDraggedItemRotation] = useAtom(
    draggedItemRotationAtom
  );
  const [_roomItems, setRoomItems] = useAtom(roomItemsAtom);
  const [passwordMode, setPasswordMode] = useState(false);
  const [avatarMode, setAvatarMode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useAtom(avatarUrlAtom);
  const [roomID, setRoomID] = useAtom(roomIDAtom);
  const [passwordCorrectForRoom, setPasswordCorrectForRoom] = useState(false);
  const [inputValue, setInputValue] = useState(""); // 用于临时存储输入值

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setRoomID(null);
    setBuildMode(false);
    setShopMode(false);
  };
  const setRole = () => {
    if (userRole == "student") setUserRole("teacher");
    else setUserRole("student");
    console.log("userRole", userRole);
  };
  const setName = () => {
    if (inputValue.trim() && userRole) {
      setUserName(inputValue.trim());
      socket.emit("characterNameUpdate", inputValue.trim());
    }
  };

  useEffect(() => {
    setPasswordCorrectForRoom(false); // roomID改变默认密码是未通过的状态
  }, [roomID]);

  const ref = useRef();
  const [chatMessage, setChatMessage] = useState("");
  //const [userName, setUserName] = useState("");
  const sendChatMessage = () => {
    if (chatMessage.length > 0) {
      socket.emit("chatMessage", chatMessage);
      setChatMessage("");
    }
  };

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {/* 角色DIY */}
        {avatarMode && (
          <AvatarCreator
            subdomain="3dbelong"
            className="fixed top-0 left-0 z-[999999999] w-full h-full" // 设置z为无穷大，让该界面显示在最上方
            onAvatarExported={(event) => {
              let newAvatarUrl =
                event.data.url === avatarUrl.split("?")[0]
                  ? event.data.url.split("?")[0] + "?" + new Date().getTime()
                  : event.data.url;
              newAvatarUrl +=
                (newAvatarUrl.includes("?") ? "&" : "?") +
                "meshlod=1&quality=medium"; // 降低画质 加快渲染
              setAvatarUrl(newAvatarUrl);
              localStorage.setItem("avatarURL", newAvatarUrl); // 将新的头像URL存在本地
              if (roomID) {
                socket.emit("characterAvatarUpdate", newAvatarUrl);
              }
              setAvatarMode(false);
            }}
          />
        )}
        {/* 密码正确，设置状态，进入Build模式 */}
        {passwordMode && (
          <PasswordInput
            onClose={() => setPasswordMode(false)}
            onSuccess={() => {
              console.log("onSuccess", roomID);
              setBuildMode(true);
              setPasswordCorrectForRoom(true);
            }}
          />
        )}
        {/* Chat */}
        <div className="fixed inset-4 flex items-center justify-end flex-col pointer-events-none select-none">
          {roomID && !shopMode && !buildMode && (
            <div className="pointer-events-auto p-4 flex items-center space-x-4">
              <input
                type="text"
                className="w-56 border px-5 p-4 h-full rounded-full"
                placeholder="请输入信息..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // enter按钮也可以发送
                    sendChatMessage();
                  }
                }}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={sendChatMessage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* 返回大厅 */}
          <div className="flex items-center space-x-4 pointer-events-auto">
            {roomID && !shopMode && !buildMode && (
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={leaveRoom}
              >
                大厅
              </button>
            )}

            {/* BACK */}
            {(buildMode || shopMode) && draggedItem === null && (
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => {
                  // ShopMode和BuildMode的返回键都是这个
                  shopMode ? setShopMode(false) : setBuildMode(false);
                  console.log("back");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                  />
                </svg>
              </button>
            )}

            {/* AVATAR ---ROOM模式可以调整*/}
            {!buildMode && !shopMode && (
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => setAvatarMode(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </button>
            )}

            {/* DANCE */}
            {roomID && !buildMode && !shopMode && (
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => socket.emit("dance")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                  />
                </svg>
              </button>
            )}
            {/* BUILD */}
            {roomID && !buildMode && !shopMode && (
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => {
                  if (!passwordCorrectForRoom) {
                    //验证过一次就无需验证
                    setPasswordMode(true);
                  } else {
                    setBuildMode(true);
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </button>
            )}
            {/* SHOP */}
            {buildMode && !shopMode && draggedItem === null && (
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => setShopMode(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                  />
                </svg>
              </button>
            )}

            {/* ROTATE */}
            {buildMode && !shopMode && draggedItem !== null && (
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() =>
                  setDraggedItemRotation(
                    draggedItemRotation === 3 ? 0 : draggedItemRotation + 1
                  )
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            )}
            {/* CANCEL */}
            {buildMode && !shopMode && draggedItem !== null && (
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => setDraggedItem(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {/* REMOVE ITEM */}
            {buildMode && !shopMode && draggedItem !== null && (
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => {
                  setRoomItems((prev) => {
                    const newItems = [...prev];
                    newItems.splice(draggedItem, 1);
                    console.log(newItems);
                    return newItems;
                  });
                  setDraggedItem(null);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            )}
            {/*SETROLE*/}
            {!roomID && !shopMode && !buildMode && (
              <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={setRole}
              >
                {userRole}
              </button>
            )}
            {!roomID && !shopMode && !buildMode && (
              <div className="pointer-events-auto p-4 flex items-center space-x-4">
                <input
                  type="text"
                  value={inputValue}
                  className="w-56 border px-5 p-4 h-full rounded-full"
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="请输入昵称..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // enter按钮也可以发送
                      setName();
                    }
                  }}
                  // //value={userName}
                  // onChange={(e) => setUserName(e.target.value)}
                />
                {/* <button
                className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                //onClick={setName()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button> */}
                <button
                  className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
                  //onClick={setName}
                  onClick={() => {
                    socket.emit("characterNameUpdate", inputValue.trim());
                    console.log("setName", inputValue.trim());
                    console.log("userNole", userRole);
                  }}
                >
                  setname
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default UI;
