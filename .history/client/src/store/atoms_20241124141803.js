import { atom } from 'jotai';

// 用户相关状态
export const userNameAtom = atom('游客');
export const userRoleAtom = atom('student');
export const avatarUrlAtom = atom('https://models.readyplayer.me/6575b1a3b21c8b3e80ba1a83.glb');

// 拖拽相关状态
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0); 