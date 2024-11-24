import { atom, useAtom } from 'jotai';
import { useState } from 'react';

// 状态声明
export const userRoleAtom = atom('student');
export const userNameAtom = atom('someone');
export const buildModeAtom = atom(false);
export const shopModeAtom = atom(false);
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);
export const roomIDAtom = atom(null);
export const avatarUrlAtom = atom('https://models.readyplayer.me/6575b1a3b21c8b3e80ba1a83.glb');
export const itemsAtom = atom([]);

// UI 组件
export function UI() {
  const [userName, setUserName] = useAtom(userNameAtom);
  const [userRole, setUserRole] = useAtom(userRoleAtom);

  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const toggleRole = () => {
    setUserRole(prev => prev === 'student' ? 'teacher' : 'student');
  };

  return (
    <div className="fixed top-0 left-0 p-4">
      <input
        type="text"
        value={userName}
        onChange={handleNameChange}
        placeholder="输入昵称"
        className="mb-2 p-2 border rounded"
      />
      <button
        onClick={toggleRole}
        className="p-2 bg-blue-500 text-white rounded"
      >
        当前身份: {userRole === 'student' ? '学生' : '教师'}
      </button>
    </div>
  );
}
