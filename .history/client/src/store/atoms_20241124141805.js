import { atom } from 'jotai';

// 集中管理所有的全局状态
export const userNameAtom = atom('游客');
export const userRoleAtom = atom('student');
export const avatarUrlAtom = atom('https://models.readyplayer.me/6575b1a3b21c8b3e80ba1a83.glb');
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0); 