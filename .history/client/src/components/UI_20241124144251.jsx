import { atom } from 'jotai';

// 用户相关状态
export const userRoleAtom = atom('student');
export const userNameAtom = atom('someone');

// 模式相关状态
export const buildModeAtom = atom(false);
export const shopModeAtom = atom(false);

// 拖拽相关状态
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);

// 房间相关状态
export const roomIDAtom = atom(null);

// 头像相关状态
export const avatarUrlAtom = atom('https://models.readyplayer.me/6575b1a3b21c8b3e80ba1a83.glb');

// 其他状态...
export const itemsAtom = atom([]);
