import { atom } from 'jotai';

// 移动到 store/atoms.js 中
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);
export const roomIDAtom = atom(null);  // 这个应该是唯一的声明位置
export const avatarUrlAtom = atom('https://models.readyplayer.me/6575b1a3b21c8b3e80ba1a83.glb');
export const userRoleAtom = atom('student');
export const userNameAtom = atom('someone');
