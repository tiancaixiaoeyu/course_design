import { useAtom } from "jotai";
import { userNameAtom, userRoleAtom } from "./SocketManager";
import { AvatarCreator } from "@readyplayerme/react-avatar-creator";
import { motion } from "framer-motion";
import { roomItemsAtom } from "./Room";
import { roomIDAtom } from "./SocketManager";
import { useSelector } from "react-redux";
import { useState } from "react";

export const buildModeAtom = atom(false);
export const shopModeAtom = atom(false);
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);
export const avatarUrlAtom = atom(
  localStorage.getItem("avatarURL") ||
    "https://models.readyplayer.me/64f0265b1db75f90dcfd9e2c.glb?meshlod=1&quality=medium"
);

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

export const UI = () => {
  const [userName, setUserName] = useAtom(userNameAtom);
  const [userRole, setUserRole] = useAtom(userRoleAtom);
  const [inputValue, setInputValue] = useState(""); // 用于临时存储输入值

  const handleNameSubmit = () => {
    if (inputValue.trim() && userRole) {
      setUserName(inputValue.trim());
      // 这里可以触发加入房间或其他相关操作
    }
  };

  const handleRoleSelect = (role) => {
    setUserRole(role);
  };

  return (
    <div>
              <input
                type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="输入用户名"
        className="p-2 border rounded"
      />
      
      <div className="flex gap-4">
              <button
          className={`p-4 rounded-full ${userRole === 'student' ? 'bg-slate-800' : 'bg-slate-500'} text-white`}
          onClick={() => handleRoleSelect('student')}
              >
          student
              </button>
              <button
          className={`p-4 rounded-full ${userRole === 'teacher' ? 'bg-slate-800' : 'bg-slate-500'} text-white`}
          onClick={() => handleRoleSelect('teacher')}
        >
          teacher
              </button>
      </div>

              <button
        onClick={handleNameSubmit}
        className="p-4 bg-blue-500 text-white rounded"
        disabled={!inputValue.trim() || !userRole}
      >
        确认
                </button>
              </div>
  );
};
